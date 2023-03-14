import { Listener, OrderCreatedEvent, Subjects } from '@tnmovieticketsv1/common';
import { Order } from '../../models/order';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const order = Order.build({
            id: data.id,
            version: data.version,
            count: data.count,
            userId: data.userId,
            status: data.status,
            charge: data.charge
        });

        await order.save();

        msg.ack();
    }
}