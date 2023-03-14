import mongoose from 'mongoose';
import request from 'supertest';
import { OrderStatus } from '@tnmovieticketsv1/common';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';

it('Returns a 404 when purchasing an order that does not exist.', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            orderId: new mongoose.Types.ObjectId().toHexString(),
            token: 'asdfdasdf'
        })
        .expect(404);
});

it('Returns a 401 when purchasing an order that does not belong to the user.', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 25,
        status: OrderStatus.Created
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdfdas',
            orderId: order.id
        })
        .expect(401);
});

it('Returns a 400 when purchasing a cancelled order.', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        version: 1,
        price: 25,
        status: OrderStatus.Cancelled
    });

    await order.save();

    await request(app)
        .post('api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'asdfdfas',
            orderId: order.id
        })
        .expect(400);
});