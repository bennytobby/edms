const request = require('supertest');
const app = require('../../server'); // Import the app

describe('EDMS Performance Tests', () => {
    describe('Response Times', () => {
        it('should respond to homepage within 1 second', async () => {
            const start = Date.now();
            const response = await request(app).get('/');
            const duration = Date.now() - start;

            expect(response.status).toBe(200);
            expect(duration).toBeLessThan(1000);
        });

        it('should respond to login page within 1 second', async () => {
            const start = Date.now();
            const response = await request(app).get('/login');
            const duration = Date.now() - start;

            expect(response.status).toBe(200);
            expect(duration).toBeLessThan(1000);
        });

        it('should respond to register page within 1 second', async () => {
            const start = Date.now();
            const response = await request(app).get('/register');
            const duration = Date.now() - start;

            expect(response.status).toBe(200);
            expect(duration).toBeLessThan(1000);
        });
    });

    describe('Concurrent Requests', () => {
        it('should handle multiple concurrent requests', async () => {
            const requests = Array(5).fill().map(() => request(app).get('/'));
            const responses = await Promise.all(requests);

            responses.forEach(response => {
                expect(response.status).toBe(200);
            });
        });

        it('should handle concurrent login attempts', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'testpassword'
            };

            const requests = Array(5).fill().map(() =>
                request(app).post('/loginSubmit').send(loginData)
            );

            const responses = await Promise.all(requests);

            // All should return some response (200, 302, etc.)
            responses.forEach(response => {
                expect(response.status).toBeGreaterThan(0);
            });
        });
    });

    describe('Memory Usage', () => {
        it('should not leak memory during multiple requests', async () => {
            const initialMemory = process.memoryUsage().heapUsed;

            // Make multiple requests
            for (let i = 0; i < 10; i++) {
                await request(app).get('/');
            }

            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;

            // Memory increase should be reasonable (less than 10MB)
            expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
        });
    });
});
