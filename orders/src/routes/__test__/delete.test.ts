import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { TicketStatus } from '../../models/ticket-status';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('Marks an order as cancelled.', async () => {
    // Create a ticket with ticket model. 
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
        id: ticketId, 
        title: 'concert', 
        description: 'maroon 5',
        price: 25, 
        maxCount: 50, 
        currentCount: 23,
        status: TicketStatus.Available
    });

    await ticket.save();

    const user = global.signin();

    // Make a request to create an order.
    const order = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({
            ticketId: ticketId, 
            count: 2
        })
        .expect(201);
    
    // Make a request to cancel the order. 
    await request(app)
        .delete(`/api/orders/${order.body.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    // Expectation to make sure the order is cancelled.
    const updatedOrder = await Order.findById(order.body.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Emits an order-cancelled event.', async () => {
    // Create a ticket 
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert', 
        description: 'maroon 5',
        price: 25, 
        maxCount: 50, 
        currentCount: 34,
        status: TicketStatus.Available
    });

    await ticket.save();

    const user = global.signin();

    // Make a request to create an order
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({
            ticketId: ticket.id,
            count: 2
        })
        .expect(201);

    // Make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});