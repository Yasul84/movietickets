import { Message } from 'node-nats-streaming';
import { Subjects, Listener, MovieUpdatedEvent } from '@tnmovieticketsv1/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<MovieUpdatedEvent> {
    subject: Subjects.MovieUpdated = Subjects.MovieUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: MovieUpdatedEvent['data'], msg: Message) {
        console.log(`Ticket id: ${data.id} and version number: ${data.version}.`)
        const ticket = await Ticket.findByEvent(data);
        
        if (!ticket) {
            throw new Error('Ticket not found.');
        }

        const { title, price, description, maxCount, currentCount, status, version } = data;

        ticket.set({
            title,
            price, 
            description, 
            maxCount, 
            currentCount, 
            status,
            version
        });

        await ticket.save();

        msg.ack();
    }
}