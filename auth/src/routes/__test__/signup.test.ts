import { app } from '../../app';
import request from 'supertest';

it('Returns a 201 on successful signup', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com', 
            password: 'password'
        })
        .expect(201);
});

it('Returns a 400 with an invalid email', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'asdfdsfda', 
            password: 'password'
        })
        .expect(400);
});

it('Returns a 400 with an invalid password', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com', 
            password: 'p'
        })
        .expect(400);
});

it('Returns a 400 with missing email and password', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({})
        .expect(400);
});

it('Disallows duplicate email addresses', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com', 
            password: 'password'
        })
        .expect(201);

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com', 
            password: 'password'
        })
        .expect(400);
});

it('Sets a cookie after successful signup', async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com', 
            password: 'password'
        })
        .expect(201);

    expect(response.get('Set-Cookie')).toBeDefined();
});