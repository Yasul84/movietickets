import express, { Request, Response } from 'express';
import { Order, OrderStatus } from '../models/order';
import { NotAuthorizedError, NotFoundError, requireAuth } from '@tnmovieticketsv1/common';
import { natsWrapper } from '../nats-wrapper';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';

const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const { orderId } = req.params;

    console.log(`orderId is: ${orderId}`);

    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    const updatedVersion = order.version + 1;

    order.set({ status: OrderStatus.Cancelled, version: updatedVersion });

    console.log(`Order status is: ${order.status}. Order version is: ${order.version}.`);

    await order.save();
    
    // Publish an event indicating an order has been cancelled.
    new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id, 
        count: order.count,
        version: order.version,
        status: order.status,
        userId: order.userId,
        movie: {
            id: order.ticket.id, 
            maxCount: order.ticket.maxCount,
            currentCount: order.ticket.currentCount,
            version: order.ticket.version
        }
    });

    res.status(204).send(order);
});

export { router as deleteOrderRouter };