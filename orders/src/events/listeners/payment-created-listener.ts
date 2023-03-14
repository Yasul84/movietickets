import { Listener, PaymentCreatedEvent, Subjects, OrderStatus } from '@tnmovieticketsv1/common';
import { OrderUpdatedPublisher } from '../publishers/order-updated-publisher';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';


export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const { orderId, version } = data;
        const order = await Order.findById(orderId);

        if (!order) {
            throw new Error('Order not found.');
        }

        const updatedVersion = version + 1;
        order.set({ status: OrderStatus.Completed, version: updatedVersion });

        console.log(`Order status is: ${order.status}. Order version is: ${order.version}.`);

        await order.save();

        await new OrderUpdatedPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            status: order.status,
            count: order.count,
            userId: order.userId,
            charge: order.charge,
            movie: {
                id: order.ticket.id,
                price: order.ticket.price,
                maxCount: order.ticket.maxCount,
                currentCount: order.ticket.currentCount,
                version: order.ticket.version
            }
        });

        msg.ack();
    }
}