import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler } from '@tnmovieticketsv1/common';
import { NotFoundError } from '@tnmovieticketsv1/common';

const app = express();

// Enabling trust proxy will allow Express to know beforehand that it's sitting behind a proxy (ingress-nginx), and future port-forwarding actions can be trusted.
app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false, 
        secure: process.env.NODE_ENV !== 'test'
    })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*', async (req, res, next) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
