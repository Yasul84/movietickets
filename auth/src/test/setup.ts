import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

declare global {
    var signin: () => Promise<string[]>;
}

let mongo: any;

// BeforeAll is a Jest method. Much like an express middleware, all enclosed logic is run before all tests are to be executed within a container.
beforeAll( async() => {
    process.env.JWT_KEY = 'asdfasdf';

    // The create function creates, and starts a fresh MongoDB server on some free port.
    const mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

// BeforeEach is another Jest method. It runs a single function before each of the tests run in a container.
beforeEach( async() => {
    const collections = await mongoose.connection.db.collections();

    // It appears we are deleting all previous data on the MongoDB server so each test can start off with a clean slate.
    for ( let collection of collections) {
        await collection.deleteMany({});
    }
});

// AfterAll is another Jest method. It executes all encompassed logic after all tests in the container have been completed.
afterAll( async() => {
    // If there are any instances of the MongoDB memory server still running, then shut them down.
    if (mongo) {
        await mongo.stop();
    }

    // Gracefully shut down the MongoDB connection.
    await mongoose.connection.close();
});

global.signin = async () => {
    const email = 'test@test.com';
    const password = 'password';

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email, password
        })
        .expect(201);

        const cookie = response.get('Set-Cookie');
        return cookie;
};