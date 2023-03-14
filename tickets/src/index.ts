import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';

import { OrderUpdatedListener } from './events/listeners/order-updated-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined.');
    }

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined.');
    }

    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined.');
    }

    if(!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID must be defined.');
    }

    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined.');
    }

    try {
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID, 
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL
        );

        await natsWrapper.client.on('close', () => {
            console.log('NATS connection closed.');
            process.exit();
        });

        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen();
        new OrderCancelledListener(natsWrapper.client).listen();
        new OrderUpdatedListener(natsWrapper.client).listen();

        await mongoose.connect(process.env.MONGO_URI);
    
        console.log('Connected to MongoDB.');
        
    } catch (error) {
        console.log(error);
    }

    app.listen(3000, function () {
        console.log('Listening on port: 3000.');
    });
};

start();