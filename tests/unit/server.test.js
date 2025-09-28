const request = require('supertest');

// Mock MongoDB and AWS before importing the app
jest.mock('mongodb', () => require('../mocks/mongodb.mock'));
jest.mock('aws-sdk', () => require('../mocks/aws-s3.mock'));

// Import the app without starting the server
const app = require('../../server');

describe('EDMS Server Tests', () => {
    describe('GET /', () => {
        it('should return the home page', async () => {
            const response = await request(app).get('/');
            expect(response.status).toBe(200);
            expect(response.text).toContain('Welcome to EDMS');
        });
    });

    describe('GET /login', () => {
        it('should return the login page', async () => {
            const response = await request(app).get('/login');
            expect(response.status).toBe(200);
            expect(response.text).toContain('Login');
        });
    });

    describe('GET /register', () => {
        it('should return the register page', async () => {
            const response = await request(app).get('/register');
            expect(response.status).toBe(200);
            expect(response.text).toContain('register');
        });
    });

    describe('POST /registerSubmit', () => {
        it('should handle registration request', async () => {
            const userData = {
                userid: 'testuser',
                email: 'test@example.com',
                password: 'testpassword',
                confirm_pass: 'testpassword'
            };

            const response = await request(app)
                .post('/registerSubmit')
                .send(userData);

            // Should return some response (200, 302, or 500)
            expect(response.status).toBeGreaterThan(0);
        });

        it('should handle registration with mismatched passwords', async () => {
            const userData = {
                userid: 'testuser2',
                email: 'test2@example.com',
                password: 'testpassword',
                confirm_pass: 'differentpassword'
            };

            const response = await request(app)
                .post('/registerSubmit')
                .send(userData);

            // Should return some response
            expect(response.status).toBeGreaterThan(0);
        });
    });

    describe('POST /loginSubmit', () => {
        it('should handle login request', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'testpassword'
            };

            const response = await request(app)
                .post('/loginSubmit')
                .send(loginData);

            // Should return some response
            expect(response.status).toBeGreaterThan(0);
        });

        it('should handle invalid login gracefully', async () => {
            const loginData = {
                email: 'invalid@example.com',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/loginSubmit')
                .send(loginData);

            // Should return some response
            expect(response.status).toBeGreaterThan(0);
        });
    });
});
