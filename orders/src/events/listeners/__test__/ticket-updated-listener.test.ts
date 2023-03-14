import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { MovieUpdatedEvent } from '@tnmovieticketsv1/common';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';


const setup = async () => {
    // Create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(), 
        title: 'concert', 
        description: 'maroon 5',
        price: 20, 
        maxCount: 50,
        currentCount: 23
    });

    await ticket.save();

    // Create a fake data object
    const data: MovieUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'new concert', 
        description: 'linkin park',
        price: 999, 
        maxCount: 100, 
        currentCount: 54,
        userId: new mongoose.Types.ObjectId().toHexString()
    };

    // Create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    // Return all of this stuff
    return { msg, data, ticket, listener };
};

it('Finds, updates, and saves a ticket.', async () => {
    const { msg, data, ticket, listener } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.description).toEqual(data.description);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.maxCount).toEqual(data.maxCount);
    expect(updatedTicket!.currentCount).toEqual(data.currentCount);
});

it('It acks the message.', async () => {
    const { msg, data, listener, ticket } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('Does not call ack if the event has a skipped version number.', async () => {
    const { msg, data, listener, ticket } = await setup();

    data.version = 10;

    expect(listener.onMessage(data, msg)).rejects.toThrow();

    expect(msg.ack).not.toHaveBeenCalled();
});