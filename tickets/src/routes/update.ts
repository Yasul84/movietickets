import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, requireAuth, NotFoundError, NotAuthorizedError, BadRequestError } from '@tnmovieticketsv1/common';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id', /* requireAuth, */ [
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required.'),
    body('description')
        .not()
        .isEmpty()
        .withMessage('Description is required.'),
    body('price')
        .isFloat({ gt: 0 })
        .withMessage('Price must be provided and be greater than zero.'),
    body('maxCount')
        .isFloat({ gt: 0 })
        .withMessage('Match number to auditorium capacity.'),
    body('currentCount')
        .isFloat({ gt: 0 })
        .withMessage('Must reflect current number of tickets sold.')
], validateRequest, async ( req: Request, res: Response ) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        throw new NotFoundError();
    }

    /* if (ticket.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    } */

    ticket.set({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        maxCount: req.body.maxCount,
        currentCount: req.body.currentCount
    });

    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.id,
        price: ticket.price, 
        description: ticket.description,
        maxCount: ticket.maxCount,
        currentCount: ticket.currentCount,
        userId: ticket.userId,
        version: ticket.version, 
        status: ticket.status
    });

    res.send(ticket);
});

export { router as updateTicketRouter };