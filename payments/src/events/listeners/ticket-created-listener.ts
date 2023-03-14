import { Message } from 'node-nats-streaming';
import { Subjects, Listener, MovieCreatedEvent } from '@tnmovieticketsv1/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<MovieCreatedEvent> {
    subject: Subjects.MovieCreated = Subjects.MovieCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: MovieCreatedEvent['data'], msg: Message) {
        const { price, id } = data;
        const ticket = Ticket.build({
            price, id
        });

        await ticket.save();

        msg.ack();
    }
}