import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@tnmovieticketsv1/common';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express();

router.post('/api/tickets', /* requireAuth, */ [
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    body('description')
        .not()
        .isEmpty()
        .withMessage('Description is required.'),
    body('price')
        .isFloat({ gt: 0 })
        .withMessage('Price must be greater than zero.'),
    body('maxCount')
        .isFloat({ gt: 0 })
        .withMessage('Match number to auditorium capacity.'),
    body('currentCount')
        .isFloat({ gt: 0 })
        .withMessage('Needs to reflect current number of tickets sold.')
], validateRequest, async (req: Request, res: Response) => {
    const { title, price, description, maxCount, currentCount, status } = req.body;

    const ticket = Ticket.build({
        title: title,
        description: description,
        price: price,
        maxCount: maxCount,
        currentCount: currentCount,
        userId: req.currentUser!.id,
        status: status 
    });

    await ticket.save();

    await new TicketCreatedPublisher(natsWrapper.client).publish({
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

    res.status(201).send(ticket);    
});

export { router as createTicketRouter };