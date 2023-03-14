import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, NotFoundError, BadRequestError } from '@tnmovieticketsv1/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order, OrderStatus } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { MovieUpdatedPublisher } from '../events/publishers/movie-updated-publisher';
import { natsWrapper } from '../nats-wrapper';
import { TicketStatus } from '../models/ticket-status';


const router = express.Router();

router.post('/api/orders', requireAuth, [
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('TicketId must be provided.'),
    body('count')
        .isFloat({ gt: 0 })
        .withMessage('Desired ticket count has to be greater than zero.')
], validateRequest, async (req: Request, res: Response) => {
    const { ticketId, count } = req.body;

    // Find the ticket/movie.
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        throw new NotFoundError();
    }

    // Ensure that movie has not been sold out. 
    if (ticket.status === TicketStatus.Unavailable) {
        throw new BadRequestError('Sorry, but the movie tickets are sold out.');
    }

    // Add count from request parameter to ticket's currentCount.
    /* const updatedCount = count + ticket.currentCount;

    console.log(updatedCount); */

    // Check how the updated ticket count compares to ticket limit.
    /* if (updatedCount > ticket.maxCount) {
        throw new BadRequestError('Sorry, your ticket quantity exceeds the maximum of ticket availability. Try to reduce your ticket order quantity.');
    }
    
    if (updatedCount === ticket.maxCount) {
        ticket.set({ status: TicketStatus.Unavailable, currentCount: updatedCount });

        console.log(`Ticket status is: ${ticket.status} and new ticket currentCount is: ${ticket.currentCount}.`);

        await ticket.save();
    }

    if (updatedCount < ticket.maxCount) {
        ticket.set({ status: TicketStatus.Available, currentCount: updatedCount });

        console.log(`Ticket status is: ${ticket.status} and new ticket currentCount is: ${ticket.currentCount}.`);
    
        await ticket.save();
    } */

    // Publish ticket updated event.
    /* new MovieUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        version: ticket.version,
        description: ticket.description,
        price: ticket.price,
        maxCount: ticket.maxCount,
        currentCount: ticket.currentCount,
        status: ticket.status,
        userId: req.currentUser!.id
    }); */

    /* const max = ticket.maxCount;
    console.log(`maxCount is: ${max}`);

    const current = ticket.currentCount;
    console.log(`currentCount is: ${current}`);

    let statusFull;
    if (current >= max) {
        statusFull = true;
    } else {
        statusFull = false;
    }

    if (statusFull) {
        console.log('Movie ticket is no longer available for purchase.');

        throw new BadRequestError('Ticket is sold out.');

    } else {
        console.log('Movie ticket is still available for purchase.');
    } */

    // Update currentCount of ticket.
    /* const updateTicketCount = ticket.currentCount + count;

    console.log(`Updated currentCount of ticket: ${updateTicketCount}`);

    ticket.set({
        currentCount: updateTicketCount
    });

    console.log(`Check if ticket document has been updated correctly: ${ticket.currentCount}`);

    await ticket.save();

    // Check again to see if updated ticket currentCount exceeds ticket maxCount after an order has been placed.
    if (ticket.currentCount >= ticket.maxCount) {
        throw new Error('Move ticket has been sold out. Reminder to change status accordingly.');
    } else {
        console.log('Movie tickets are still available for sale after current order has been placed.');
    } */

    // Calculate charge.
    const chargeAmount = ticket.price * count;

    // Build order and save.
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        count: count,
        ticket: ticket,
        charge: chargeAmount
    });

    await order.save();

    console.log(`Saved order id: ${order.id}`);

    // Publish the event to NATS.
    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version, 
        userId: order.userId,
        status: order.status,
        count: order.count,
        charge: order.charge,
        movie: {
            id: ticket.id,
            price: ticket.price, 
            currentCount: ticket.currentCount, 
            maxCount: ticket.maxCount,
            version: ticket.version
        }
    });

    res.status(201).send({order});
});

export { router as newOrderRouter };