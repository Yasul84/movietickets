import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { TicketStatus } from '../../models/ticket-status';

it('Fetches the order', async () => {
    // Create a ticket.
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert', 
        description: 'maroon 5',
        price: 26, 
        maxCount: 50, 
        currentCount: 24,
        status: TicketStatus.Available
    });

    await ticket.save();

    const user = global.signin();
    // Make a request to build an order with this ticket.
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({
            ticketId: ticket.id, 
            count: 2
        })
        .expect(201);

    // Make a request to fetch the Order
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send({})
        .expect(200)

    expect(fetchedOrder.id).toEqual(order.id);
});