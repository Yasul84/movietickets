import express from 'express';
import 'express-async-errors'; 
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { createChargeRouter } from './routes/new';
import { showOrderRouter } from './routes/show-order';

import { errorHandler } from '@tnmovieticketsv1/common';
import { NotFoundError } from '@tnmovieticketsv1/common';
import { currentUser } from '@tnmovieticketsv1/common'; 


const app = express();

app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test'
    })
);

app.use(currentUser);
app.use(createChargeRouter);
app.use(showOrderRouter);

app.all('*', async (req, res, next) => {
    throw new NotFoundError(); 
});

app.use(errorHandler);

export { app };