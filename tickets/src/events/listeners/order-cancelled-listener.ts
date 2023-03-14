import { Message } from 'node-nats-streaming';
import { Listener, OrderCancelledEvent } from '@tnmovieticketsv1/common';
import { Subjects } from '@tnmovieticketsv1/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketStatus } from '../../models/ticket-status';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        // Find ticket.
        const ticket = await Ticket.findById(data.movie.id);

        if (!ticket) {
            throw new Error('Ticket not found.');
        }

        // Update ticket currentCount by subtracting order's count from ticket's previous currentCount.
        const updatedCount = data.movie.currentCount - data.count;

        ticket.set({ currentCount: updatedCount });

        // Update ticket version
        const updatedVersion = data.movie.version + 1;

        ticket.set({ version: updatedVersion });

        // Update the ticket status, if necessary.
        if (ticket.currentCount < ticket.maxCount) {
            ticket.set({ status: TicketStatus.Available });
        }

        console.log(`Ticket status: ${ticket.status}. Ticket currentCount: ${ticket.currentCount}. Ticket version: ${ticket.version}.`);

        // Save the ticket.
        await ticket.save();

        // Publish the updated ticket.
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
    }
}