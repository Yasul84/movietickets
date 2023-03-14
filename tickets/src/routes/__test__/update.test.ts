import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';


/* const createTicket = () => {
    return request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: "concert", 
            description: 'maroon 5', 
            price: 20
        })
        .expect(201);
};

it('Is capable of updating a ticket', async () => {
    const ticket = await createTicket();

    const title = 'movie';
    const description = 'avatar the way of water';
    const price = 22;

    const response = await request(app)
        .put(`/api/tickets/${ticket.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title,
            description,
            price
        })
        .expect(201);

    expect(response.body.title).toEqual(title);
    expect(response.body.description).toEqual(description);
    expect(response.body.price).toEqual(price);
}); */

it('Returns a 404 if the provided ID does not exist.', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    return request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'concernt', 
            description: 'maroon 5', 
            price: 20,
            maxCount: 50, 
            currentCount: 2
        })
        .expect(404);
});

it('Returns a 401 if the user is not authenticated.', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    return request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'concert', 
            description: 'maroon 5', 
            price: 20, 
            maxCount: 50, 
            currentCount: 2
        })
        .expect(401);        
});

it('Returns a 401 if the user does not own the ticket.', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'concert', 
            description: 'maroon 5', 
            price: 20, 
            maxCount: 50, 
            currentCount: 2
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'movie', 
            description: 'avatar the way of water', 
            price: 222, 
            maxCount: 30, 
            currentCount: 3
        })
        .expect(401);
});

it('Returns a 400 if the user provides an invalid title or price for the update.', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'concert', 
            description: 'maroon 5', 
            price: 20, 
            maxCount: 50, 
            currentCount: 2
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'concert', 
            description: 'maroon 5', 
            price: -20, 
            maxCount: 50, 
            currentCount: 2
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '', 
            description: 'maroon 5', 
            price: 25, 
            maxCount: 45, 
            currentCount: 3
        })
        .expect(400);
});

it('Returns a 400 if the user provides an invalid description or maxCount or currentCount for the update.', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'concert', 
            description: 'maroon 5', 
            price: 34,
            maxCount: 50, 
            currentCount: 2
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'concert', 
            description: '',
            price: 33,
            maxCount: 12, 
            currentCount: 2
        })
        .expect(400)

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'concert', 
            description: 'linkin park', 
            price: 156,
            maxCount: -14, 
            currentCount: 2
        })
        .expect(400);

        await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'concert', 
            description: 'linkin park', 
            price: 156,
            maxCount: 14, 
            currentCount: -2
        })
        .expect(400);
});

it('Updates the ticket when given valid inputs', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'concert', 
            description: 'maroon 5', 
            price: 20, 
            maxCount: 50, 
            currentCount: 2
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'movie', 
            description: 'avatar the way of water', 
            price: 25, 
            maxCount: 45, 
            currentCount: 5
        })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({});

    expect(ticketResponse.body.title).toEqual('movie');
    expect(ticketResponse.body.description).toEqual('avatar the way of water');
    expect(ticketResponse.body.price).toEqual(25);
    expect(ticketResponse.body.maxCount).toEqual(45);
    expect(ticketResponse.body.currentCount).toEqual(5);
});

it('Publishes an event', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'asdf', 
            price: 20, 
            description: 'shindig', 
            maxCount: 50, 
            currentCount: 2
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'fdsa', 
            price: 30, 
            description: 'shitzu', 
            maxCount: 45, 
            currentCount: 23
        })
        .expect(200);
        
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});