import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { TicketStatus } from '../../models/ticket-status';

const buildTicket = async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert', 
        description: 'maroon 5',
        price: 20, 
        maxCount: 50, 
        currentCount: 23,
        status: TicketStatus.Available
    });

    await ticket.save();

    return ticket;
};

it('Fetches orders for a particular user', async () => {
    // Create three tickets.
    const ticketOne = await buildTicket();
    const ticketTwo = await buildTicket();
    const ticketThree = await buildTicket();

    const userOne = global.signin();
    const userTwo = global.signin();

    // Create one order as User #1.
    await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({
            ticketId: ticketOne.id,
            count: 2
        })
        .expect(201);

    // Create two orders as User #2.
    const { body: orderOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({
            ticketId: ticketTwo.id, 
            count: 2
        })
        .expect(201);

    const { body: orderTwo } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({
            ticketId: ticketThree.id,
            count: 1
        })
        .expect(201);

    // Make request to get orders for User #2 only.
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .send({})
        .expect(200);

    // Ensure we only get the orders for User #2.
    expect(response.body.length).toEqual(2);

    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);

    expect(response.body[0].ticket.id).toEqual(ticketTwo);
    expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});