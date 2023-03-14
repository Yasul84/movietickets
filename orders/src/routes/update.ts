import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order, OrderStatus } from '../models/order';
import { TicketStatus } from '../models/ticket-status';
import { NotAuthorizedError, NotFoundError, requireAuth, validateRequest, BadRequestError } from '@tnmovieticketsv1/common';
import { natsWrapper } from '../nats-wrapper';
import { OrderUpdatedPublisher } from '../events/publishers/order-updated-publisher';
import mongoose from 'mongoose';

const router = express.Router();

router.put('/api/orders/:orderId', requireAuth, [
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('TicketId must be provided.'),
    body('count')
        .isFloat({ gt: 0 })
        .withMessage('Count must be greater than zero.')
], validateRequest, async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const { count } = req.body;

    console.log(`orderId is: ${orderId}. New count is: ${count}`);

    // Find the order.
    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
        throw new NotFoundError();
    }

    // Confirm authorization.
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    // Ensure that movie has not been sold out. 
    if (order.ticket.status === TicketStatus.Unavailable) {
        throw new BadRequestError('Sorry, but the movie tickets are sold out.');
    }

    const updatedVersion = order.version + 1;

    // Calculate updated charge amount.
    const chargeAmount = order.ticket.price * count;

    order.set({ version: updatedVersion, count: count, charge: chargeAmount });

    await order.save();
    
    // Publish an event indicating an order has been cancelled.
    new OrderUpdatedPublisher(natsWrapper.client).publish({
        id: order.id, 
        count: order.count,
        version: order.version,
        status: order.status,
        userId: order.userId,
        charge: chargeAmount,
        movie: {
            id: order.ticket.id, 
            maxCount: order.ticket.maxCount,
            price: order.ticket.price,
            currentCount: order.ticket.currentCount,
            version: order.ticket.version
        }
    });

    res.status(200).send({order});
});

export { router as updateOrderRouter };