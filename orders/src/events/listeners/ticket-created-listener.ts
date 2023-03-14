import { Message } from 'node-nats-streaming';
import { Subjects, Listener, MovieCreatedEvent } from '@tnmovieticketsv1/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<MovieCreatedEvent> {
    subject: Subjects.MovieCreated = Subjects.MovieCreated;
    queueGroupName = queueGroupName;  
    
    async onMessage(data: MovieCreatedEvent['data'], msg: Message) {
        const { title, description, price, maxCount, currentCount, id, status } = data;

        const ticket = Ticket.build({
            id,
            title,
            description,
            price, 
            maxCount, 
            currentCount,
            status
        });

        await ticket.save();

        msg.ack();
    }
}