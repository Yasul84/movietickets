import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@tnmovieticketsv1/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { Order } from '../../../models/order';

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        count: 1,
        userId: 'asdf',
        movie: {
            id: 'asdfdfa',
            price: 25,
            currentCount: 23,
            maxCount: 50,
            version: 0
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
};

it('Replicates the order info.', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order!.price).toEqual(data.movie.price);
});

it('Acks the message.', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

