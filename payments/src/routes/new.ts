import { stripe } from '../stripe';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from '@tnmovieticketsv1/common';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/payments', requireAuth, [
    body('orderId')
        .not()
        .isEmpty(),
    body('token')
        .not()
        .isEmpty()
], validateRequest, async (req: Request, res: Response) => {
    // Find order. 
    const { orderId, token } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
        throw new BadRequestError('Cannot pay for a cancelled order.');
    }

    // Create charge.
    const charge = await stripe.charges.create({
        currency: 'usd',
        amount: order.charge * 100,
        source: token
    });

    // Create payment.
    const payment = Payment.build({
        orderId: orderId,
        stripeId: charge.id
    });

    await payment.save();

    // Update order. Note this is a work-around. The true updated order resides in this payment service when it should actually live in the orders service.
    order.set({ status: OrderStatus.Completed });

    await order.save();

    // Publish payment creation event.
    /* new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId,
        count: order.count,
        version: payment.version
    });
 */
    res.status(201).send({ id: payment.id });
});

export { router as createChargeRouter };