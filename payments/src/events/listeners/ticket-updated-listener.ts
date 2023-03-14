import { Message } from 'node-nats-streaming';
import { Subjects, Listener, MovieUpdatedEvent } from '@tnmovieticketsv1/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<MovieUpdatedEvent> {
    subject: Subjects.MovieUpdated = Subjects.MovieUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: MovieUpdatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findByEvent(data);

        if (!ticket) {
            throw new Error('Ticket not found.');
        }

        ticket.set({ version: data.version, currentCount: data.currentCount, maxCount: data.maxCount, status: data.status });

        await ticket.save();

        msg.ack();
    }
}