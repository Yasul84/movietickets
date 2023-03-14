import express, { Request, Response } from 'express';
import { NotAuthorizedError, NotFoundError, requireAuth } from '@tnmovieticketsv1/common';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/payments/:orderId', requireAuth, async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');

    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    res.send({order});
});

export { router as showOrderRouter };