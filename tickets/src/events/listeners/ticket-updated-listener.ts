import { Message } from 'node-nats-streaming';
import { Listener, MovieUpdatedEvent } from '@tnmovieticketsv1/common';
import { Subjects } from '@tnmovieticketsv1/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class MovieUpdatedListener extends Listener<MovieUpdatedEvent> {
    subject: Subjects.MovieUpdated = Subjects.MovieUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: MovieUpdatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.id);

        if (!ticket) {
            throw new Error('Ticket not found.');
        }

        ticket.set({
            id: data.id,
            title: data.title,
            price: data.price,
            description: data.description,
            version: data.version,
            userId: data.userId,
            maxCount: data.maxCount,
            currentCount: data.currentCount,
            status: data.status                                   
        });

        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            price: ticket.price,
            version: ticket.version,
            maxCount: ticket.maxCount,
            currentCount: ticket.currentCount,
            status: ticket.status,
            userId: ticket.userId
        });

        msg.ack();
    }
}