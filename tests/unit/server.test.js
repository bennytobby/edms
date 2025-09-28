const request = require('supertest');
const express = require('express');

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
        it('should register a new user', async () => {
            const userData = {
                userid: 'testuser',
                email: 'test@example.com',
                password: 'testpassword',
                confirm_pass: 'testpassword'
            };

            const response = await request(app)
                .post('/registerSubmit')
                .send(userData);

            // Should redirect to login or dashboard
            expect([200, 302]).toContain(response.status);
        });

        it('should reject registration with mismatched passwords', async () => {
            const userData = {
                userid: 'testuser2',
                email: 'test2@example.com',
                password: 'testpassword',
                confirm_pass: 'differentpassword'
            };

            const response = await request(app)
                .post('/registerSubmit')
                .send(userData);

            expect(response.status).toBe(200);
            expect(response.text).toContain('Password Mismatch');
        });
    });

    describe('POST /loginSubmit', () => {
        it('should login with valid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'testpassword'
            };

            const response = await request(app)
                .post('/loginSubmit')
                .send(loginData);

            // Should redirect to dashboard
            expect([200, 302]).toContain(response.status);
        });

        it('should reject login with invalid credentials', async () => {
            const loginData = {
                email: 'invalid@example.com',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/loginSubmit')
                .send(loginData);

            expect(response.status).toBe(200);
            expect(response.text).toContain('User Not Found');
        });
    });
});
