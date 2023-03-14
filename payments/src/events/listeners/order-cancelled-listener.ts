import { Listener, OrderCancelledEvent, Subjects, OrderStatus } from '@tnmovieticketsv1/common';
import { Order } from '../../models/order';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        /* let order;
        if (data.version === 0) {
            order = await Order.findById(data.id);
        } 
        
        if (data.version !== 0) {
            order = await Order.findOne({
                _id: data.id,
                version: data.version - 1
            });
        } */

        const order = await Order.findByEvent(data);

        /* const order = await Order.findById(data.id); */
        
        if (!order) {
            throw new Error('Order not found.');
        }

        const updatedVersion = order.version + 1;

        order.set({ status: OrderStatus.Cancelled, version: updatedVersion });

        console.log(`Order status is: ${order.status}. Order version is: ${order.version}.`);

        await order.save();

        msg.ack();
    }
}