import { Message } from 'node-nats-streaming';
import { Listener, OrderUpdatedEvent } from '@tnmovieticketsv1/common';
import { Subjects } from '@tnmovieticketsv1/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketStatus } from '../../models/ticket-status';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderUpdatedListener extends Listener<OrderUpdatedEvent> {
    subject: Subjects.OrderUpdated = Subjects.OrderUpdated;

    queueGroupName = queueGroupName;

    async onMessage(data: OrderUpdatedEvent['data'], msg: Message) {
        // Find the ticket that the order is reserving.
        const ticket = await Ticket.findById(data.movie.id);

        // If no ticket is found, then throw an error.
        if (!ticket) {
            throw new Error('Ticket not found.');
        }
        
        // Add the order's  new count to the ticket's currentCount.
        const updatedCount = data.count + data.movie.currentCount;

        console.log(`updatedCount value is: ${updatedCount}.`);

        // Determine ticket status based on updatedCount relative to ticket's maxCount.
        if (updatedCount >= data.movie.maxCount) {
            const updatedVersion = data.version + 1;
            ticket.set({ status: TicketStatus.Unavailable, currentCount: updatedCount, version: updatedVersion });

            console.log(`Ticket is now sold out. Ticket's currentCount is now: ${ticket.currentCount}. Ticket version number: ${ticket.version}.`);
        }

        if (updatedCount < data.movie.maxCount) {
            const updatedVersion = data.version + 1;
            ticket.set({ status: TicketStatus.Available, currentCount: updatedCount, version: updatedVersion });

            console.log(`Tickets are still available for purchase. Ticket's currentCount is now: ${ticket.currentCount}. Ticket version number: ${ticket.version}.`);
        }

        // Save the ticket.
        await ticket.save();

        // Propagate the ticket's updated changes to other relevant services.
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

        // Ack the message.
        msg.ack();
    };
}