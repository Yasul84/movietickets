import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';


it('Test the route handler to see if it is listening to /api/tickets for post requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});

        expect(response.status).not.toEqual(404);
});

it('Returns an error if an invalid title is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: '',
            description: 'whatever',
            price: 10,
            maxCount: 50, 
            currentCount: 2
        })
        .expect(400);

        await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            description: 'whatever',
            price: 10, 
            maxCount: 50, 
            currentCount: 2
        })
        .expect(400);
});

it('Returns an error if an invalid price is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'concert',
            description: 'whatever',
            price: -10,
            maxCount: 50, 
            currentCount: 2
        })
        .expect(400);

        await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'concert',
            description: 'whatever', 
            maxCount: 50, 
            currentCount: 2
        })
        .expect(400);
});

it('Returns an error if an invalid description is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'concert', 
            description: '',
            price: 10, 
            maxCount: 50, 
            currentCount: 2
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'concert', 
            price: 10, 
            maxCount: 50, 
            currentCount: 2
        })
        .expect(400);
});

it('Returns an error if an invalid maxCount is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'concert', 
            description: 'whatever',
            price: 10, 
            maxCount: -50, 
            currentCount: 2
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'concert', 
            description: 'whatever',
            price: 10, 
            currentCount: 2
        })
        .expect(400);
});

it('Returns an error if an invalid currentCount is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'concert', 
            description: 'whatever',
            price: 10, 
            maxCount: 50, 
            currentCount: -2
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'concert', 
            description: 'whatever',
            price: 10,
            maxCount: 50 
        })
        .expect(400);
});

it('Ascertain whether the user has been authenticated to create a new ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});

        expect(response.status).toEqual(401);
});

it('Returns a status code other than 401 if the user is already signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({})

        console.log(response.status);
        expect(response.status).not.toEqual(401);
});

it('Creates a ticket with valid inputs', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'asdf',
            description: 'this is a bad movie', 
            price: 20,
            maxCount: 50, 
            currentCount: 2
        })
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
});

it('Publishes an event', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'asdf',
            description: 'this is a bad movie', 
            price: 20,
            maxCount: 50, 
            currentCount: 2
        })
        .expect(201)
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});