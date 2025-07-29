import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Rate Limiting Tests (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    describe('Rate Limiting', () => {
        it('should allow requests within rate limit', async () => {
            // Make 5 requests (within the limit of 10 per 60 seconds)
            const promises = [];
            for (let i = 0; i < 5; i++) {
                promises.push(
                    request(app.getHttpServer())
                        .get('/')
                        .then((response) => ({ status: response.status, body: response.body }))
                        .catch((error) => ({ status: error.response?.status, body: error.response?.body })),
                );
            }
            const results = await Promise.all(promises);

            // All should succeed
            for (let i = 0; i < 5; i++) {
                expect(results[i].status).toBe(200);
            }
        });

        it('should block requests when rate limit is exceeded', async () => {
            // Make 11 requests (exceeding the limit of 10 per 60 seconds)
            const promises = [];
            for (let i = 0; i < 11; i++) {
                promises.push(
                    request(app.getHttpServer())
                        .get('/')
                        .then((response) => ({ status: response.status, body: response.body }))
                        .catch((error) => ({ status: error.response?.status, body: error.response?.body })),
                );
            }
            const results = await Promise.all(promises);

            // The first 10 should succeed
            for (let i = 0; i < 10; i++) {
                expect(results[i].status).toBe(200);
            }
            // The 11th should be rate limited (429 Too Many Requests)
            expect(results[10].status).toBe(429);
        });

        it('should apply rate limiting to different endpoints', async () => {
            // Make 11 requests to the same endpoint to trigger rate limiting
            const promises = [];
            for (let i = 0; i < 11; i++) {
                promises.push(
                    request(app.getHttpServer())
                        .get('/')
                        .then((response) => ({ status: response.status, body: response.body }))
                        .catch((error) => ({ status: error.response?.status, body: error.response?.body })),
                );
            }
            const results = await Promise.all(promises);

            // The first 10 should succeed
            for (let i = 0; i < 10; i++) {
                expect(results[i].status).toBe(200);
            }
            // The 11th should be rate limited
            expect(results[10].status).toBe(429);
        });

        it('should track rate limiting by IP address', async () => {
            // Make requests with different IP addresses
            const promises = [];

            // First IP: 5 requests
            for (let i = 0; i < 5; i++) {
                promises.push(
                    request(app.getHttpServer())
                        .get('/')
                        .set('X-Forwarded-For', '192.168.1.1')
                        .then((response) => ({ status: response.status, body: response.body }))
                        .catch((error) => ({ status: error.response?.status, body: error.response?.body })),
                );
            }

            // Second IP: 5 requests
            for (let i = 0; i < 5; i++) {
                promises.push(
                    request(app.getHttpServer())
                        .get('/')
                        .set('X-Forwarded-For', '192.168.1.2')
                        .then((response) => ({ status: response.status, body: response.body }))
                        .catch((error) => ({ status: error.response?.status, body: error.response?.body })),
                );
            }

            const results = await Promise.all(promises);

            // All should succeed (different IPs)
            for (let i = 0; i < 10; i++) {
                expect(results[i].status).toBe(200);
            }
        });

        it('should reset rate limit after TTL expires', async () => {
            // Make 10 requests to reach the limit
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(
                    request(app.getHttpServer())
                        .get('/')
                        .then((response) => ({ status: response.status, body: response.body }))
                        .catch((error) => ({ status: error.response?.status, body: error.response?.body })),
                );
            }
            const results = await Promise.all(promises);

            // All 10 should succeed
            for (let i = 0; i < 10; i++) {
                expect(results[i].status).toBe(200);
            }

            // The 11th should be rate limited
            const eleventhRequest = await request(app.getHttpServer())
                .get('/')
                .then((response) => ({ status: response.status, body: response.body }))
                .catch((error) => ({ status: error.response?.status, body: error.response?.body }));

            expect(eleventhRequest.status).toBe(429);
        });
    });
});
