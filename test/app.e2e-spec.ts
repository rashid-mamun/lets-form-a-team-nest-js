import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Health Check Endpoints', () => {
        it('/ (GET) - should return welcome message', () => {
            return request(app.getHttpServer()).get('/').expect(200).expect('welcome to lets-form-a-team');
        });

        it('/health-check (GET) - should return health status', () => {
            return request(app.getHttpServer())
                .get('/health-check')
                .expect(200)
                .expect((res) => {
                    expect(res.body.status).toBe('ok');
                    expect(res.body.info.database.status).toBe('up');
                });
        });
    });

    describe('Error Handling', () => {
        it('should handle 404 for non-existent endpoints', () => {
            return request(app.getHttpServer()).get('/non-existent').expect(404);
        });

        it('should handle malformed JSON', () => {
            return request(app.getHttpServer()).post('/auth/login').set('Content-Type', 'application/json').send('{"invalid": json}').expect(400);
        });
    });

    describe('Authentication Endpoints', () => {
        describe('POST /auth/login', () => {
            it('should fail with missing username', () => {
                return request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        password: 'password',
                    })
                    .expect(401);
            });

            it('should fail with missing password', () => {
                return request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        username: 'test',
                    })
                    .expect(401);
            });

            it('should fail with invalid credentials', () => {
                return request(app.getHttpServer())
                    .post('/auth/login')
                    .send({
                        username: 'invalid',
                        password: 'invalid',
                    })
                    .expect(401);
            });
        });

        describe('POST /auth/signup', () => {
            it('should fail without authentication token', () => {
                return request(app.getHttpServer())
                    .post('/auth/signup')
                    .send({
                        username: 'testuser',
                        password: 'password123',
                        name: 'Test User',
                        email: 'test@example.com',
                        contactNumber: '1234567890',
                        userTypeId: 2,
                    })
                    .expect(401);
            });
        });

        describe('POST /auth/logout', () => {
            it('should fail without authentication token', () => {
                return request(app.getHttpServer())
                    .post('/auth/logout')
                    .send({
                        refresh_token: 'test-token',
                    })
                    .expect(401);
            });
        });

        describe('POST /auth/refresh', () => {
            it('should fail with missing refresh token', () => {
                return request(app.getHttpServer()).post('/auth/refresh').send({}).expect(401);
            });

            it('should fail with invalid refresh token', () => {
                return request(app.getHttpServer())
                    .post('/auth/refresh')
                    .send({
                        refresh_token: 'invalid_token',
                    })
                    .expect(401);
            });
        });
    });

    describe('User Management Endpoints', () => {
        describe('GET /user', () => {
            it('should fail without authentication token', () => {
                return request(app.getHttpServer()).get('/user').expect(401);
            });
        });

        describe('GET /user/id', () => {
            it('should fail without authentication token', () => {
                return request(app.getHttpServer()).get('/user/id?id=1').expect(401);
            });

            it('should fail without user ID parameter', () => {
                return request(app.getHttpServer()).get('/user/id').expect(401);
            });
        });

        describe('POST /user/register', () => {
            it('should fail without authentication token', () => {
                return request(app.getHttpServer())
                    .post('/user/register')
                    .send({
                        username: 'testuser',
                        password: 'password123',
                        name: 'Test User',
                        email: 'test@example.com',
                        contactNumber: '1234567890',
                        userTypeId: 3,
                    })
                    .expect(401);
            });
        });
    });

    describe('Seeder Endpoints', () => {
        it('/seeder (POST) - should seed database with initial data', () => {
            return request(app.getHttpServer())
                .post('/seeder')
                .expect(201)
                .expect((res) => {
                    expect(res.body.message).toBe('Database seeded successfully');
                    expect(res.body.data).toBe(true);
                });
        });
    });
});
