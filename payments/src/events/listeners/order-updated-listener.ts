import { Listener, OrderUpdatedEvent, Subjects, OrderStatus } from '@tnmovieticketsv1/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class OrderUpdatedListener extends Listener<OrderUpdatedEvent> {
    subject: Subjects.OrderUpdated = Subjects.OrderUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderUpdatedEvent['data'], msg: Message) {
        const order = await Order.findByEvent(data);

        if (!order) {
            throw new Error('Order not found.');
        }

        order.set({ status: data.status, version: data.version, charge: data.charge, count: data.count });

        await order.save();

        msg.ack();
    }
}