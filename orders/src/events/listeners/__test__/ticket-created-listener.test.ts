import { Message } from 'node-nats-streaming';
import { MovieCreatedEvent } from '@tnmovieticketsv1/common';
import mongoose from 'mongoose';
import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // Create an instance of the listener.
    const listener = new TicketCreatedListener(natsWrapper.client);

    // Create a fake data event.
    const data: MovieCreatedEvent['data'] = {
        version: 0, 
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert', 
        description: 'maroon 5', 
        price: 20, 
        maxCount: 50, 
        currentCount: 23, 
        userId: new mongoose.Types.ObjectId().toHexString()
    }

    // Create a fake message object.
    // The @ts-ignore code snippet below tells TypeScript to not enforce the correct implementation of the Message type.
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
};

it('Creates and saves a ticket', async () => {
    const { listener, data, msg } = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure a ticket was created
    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.description).toEqual(data.description);
    expect(ticket!.price).toEqual(data.price);
    expect(ticket!.maxCount).toEqual(data.maxCount);
    expect(ticket!.currentCount).toEqual(data.currentCount);
});

it('It acks the message.', async () => {
    const { listener, data, msg } = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure the ack function is called
    expect(msg.ack).toHaveBeenCalled();
});