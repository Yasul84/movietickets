import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { TicketStatus } from '../../models/ticket-status';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it("Returns an error if the ticket does not exist", async () => {
    const ticketId = new mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId, 
            count: 1
        })
        .expect(404);
});

it('Returns an error if the ticket is sold out.', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
        id: ticketId,
        title: 'concert', 
        description: 'maroon 5',
        price: 25,
        maxCount: 50,
        currentCount: 51, 
        status: TicketStatus.Available
    });

    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId,
            count: 1
        })
        .expect(400);
});

it('Reserves a ticket successfully.', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
        id: ticketId,
        title: 'movie', 
        description: 'avatar the way of water',
        price: 20, 
        maxCount: 50, 
        currentCount: 12, 
        status: TicketStatus.Available
    });

    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId,
            count: 1
        })
        .expect(201);
});

it('Confirms a ticket is correctly saved.', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
        id: ticketId, 
        title: 'concert', 
        description: 'maroon 5',
        price: 23, 
        maxCount: 50, 
        currentCount: 34,
        status: TicketStatus.Available
    });

    await ticket.save();

    expect(ticket.maxCount).toEqual(50);
    expect(ticket.currentCount).toEqual(34);
    expect(ticket.title).toEqual('concert');
    expect(ticket.price).toEqual(23);
});

it('Emits an order created event.', async() => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert', 
        description: 'maroon 5',
        price: 25, 
        maxCount: 50, 
        currentCount: 23,
        status: TicketStatus.Available
    });
    
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId: ticket.id,
            count: 2
        })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});