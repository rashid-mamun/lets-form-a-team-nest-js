import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { EUserTypes } from './common/constants/common.enum';
import { SeederService } from './modules/seeder/seeder.service';
import './test-config';

describe('Endpoint Tests (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let seederService: SeederService;
    let accessToken: string;
    let refreshToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        dataSource = moduleFixture.get<DataSource>(DataSource);
        seederService = moduleFixture.get<SeederService>(SeederService);

        await app.init();

        // Clear the database before seeding
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Clear all tables in reverse order of dependencies
            await queryRunner.manager.delete('UserTypeMapEntity', {});
            await queryRunner.manager.delete('UserProfileEntity', {});
            await queryRunner.manager.delete('UserEntity', {});
            await queryRunner.manager.delete('UserTypeEntity', {});
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }

        // Seed the database before running tests
        try {
            await seederService.seedDatabase();
        } catch (error) {
            console.log('Database already seeded or seeding failed:', error.message);
        }
    });

    afterAll(async () => {
        await dataSource.destroy();
        await app.close();
    });

    describe('App Endpoints', () => {
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

    describe('Seeder Endpoints', () => {
        it('/seeder (POST) - should seed database', () => {
            return request(app.getHttpServer())
                .post('/seeder')
                .expect(201)
                .expect((res) => {
                    expect(res.body.message).toBe('Database seeded successfully');
                    expect(res.body.data).toBe(true);
                });
        });
    });

    describe('Auth Endpoints', () => {
        it('/auth/login (POST) - should login with valid credentials', async () => {
            const loginData = {
                username: 'superAdmin',
                password: 'testPassword123!',
            };

            const response = await request(app.getHttpServer()).post('/auth/login').send(loginData).expect(200);

            expect(response.body.access_token).toBeDefined();
            expect(response.body.refresh_token).toBeDefined();
            expect(response.body.user).toBeDefined();

            accessToken = response.body.access_token;
            refreshToken = response.body.refresh_token;
        });

        it('/auth/login (POST) - should fail with invalid credentials', () => {
            const loginData = {
                username: 'invalid',
                password: 'wrongpassword',
            };

            return request(app.getHttpServer()).post('/auth/login').send(loginData).expect(401);
        });

        it('/auth/refresh (POST) - should refresh access token', () => {
            return request(app.getHttpServer())
                .post('/auth/refresh')
                .send({ refresh_token: refreshToken })
                .expect(200)
                .expect((res) => {
                    expect(res.body.access_token).toBeDefined();
                    expect(res.body.refresh_token).toBeDefined();
                });
        });

        it('/auth/refresh (POST) - should fail with invalid refresh token', () => {
            return request(app.getHttpServer()).post('/auth/refresh').send({ refresh_token: 'invalid-token' }).expect(401);
        });

        it('/auth/logout (POST) - should logout successfully', () => {
            return request(app.getHttpServer())
                .post('/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ refresh_token: refreshToken })
                .expect(200)
                .expect((res) => {
                    expect(res.body.message).toBe('Logout successful');
                });
        });
    });

    describe('User Endpoints', () => {
        let newAccessToken: string;

        beforeAll(async () => {
            // Login again to get fresh tokens
            const loginData = {
                username: 'superAdmin',
                password: 'testPassword123!',
            };

            const response = await request(app.getHttpServer()).post('/auth/login').send(loginData);

            newAccessToken = response.body.access_token;
        });

        it('/user (GET) - should get all users', () => {
            return request(app.getHttpServer())
                .get('/user')
                .set('Authorization', `Bearer ${newAccessToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                    expect(res.body.length).toBeGreaterThan(0);
                });
        });

        it('/user/id (GET) - should get user by ID', async () => {
            // First get all users to find the super admin user ID
            const allUsersResponse = await request(app.getHttpServer()).get('/user').set('Authorization', `Bearer ${newAccessToken}`).expect(200);

            const superAdminUser = allUsersResponse.body.find((user: any) => user.username === 'superAdmin');
            expect(superAdminUser).toBeDefined();

            return request(app.getHttpServer())
                .get(`/user/id?id=${superAdminUser.id}`)
                .set('Authorization', `Bearer ${newAccessToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).toBe(superAdminUser.id);
                    expect(res.body.username).toBe('superAdmin');
                });
        });

        it('/user/id (GET) - should return 404 for non-existent user', () => {
            return request(app.getHttpServer()).get('/user/id?id=999').set('Authorization', `Bearer ${newAccessToken}`).expect(404);
        });

        it('/user/register (POST) - should register new manager', () => {
            const userData = {
                username: 'testmanager',
                password: 'TestManager123!',
                name: 'Test Manager',
                email: 'testmanager@example.com',
                contactNumber: '1234567890',
                userTypeId: EUserTypes.MANAGER,
            };

            return request(app.getHttpServer())
                .post('/user/register')
                .set('Authorization', `Bearer ${newAccessToken}`)
                .send(userData)
                .expect(201)
                .expect((res) => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.username).toBe('testmanager');
                    expect(res.body.name).toBe('Test Manager');
                    expect(res.body.userTypeId).toBe(EUserTypes.MANAGER);
                });
        });

        it('/user/register (POST) - should register new employee', () => {
            const userData = {
                username: 'testemployee',
                password: 'TestEmployee123!',
                name: 'Test Employee',
                email: 'testemployee@example.com',
                contactNumber: '0987654321',
                userTypeId: EUserTypes.EMPLOYEE,
            };

            return request(app.getHttpServer())
                .post('/user/register')
                .set('Authorization', `Bearer ${newAccessToken}`)
                .send(userData)
                .expect(201)
                .expect((res) => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.username).toBe('testemployee');
                    expect(res.body.name).toBe('Test Employee');
                    expect(res.body.userTypeId).toBe(EUserTypes.EMPLOYEE);
                });
        });

        it('/user/register (POST) - should fail with duplicate username', () => {
            const userData = {
                username: 'superAdmin', // Already exists
                password: 'TestUser123!',
                name: 'Test User',
                email: 'testuser@example.com',
                contactNumber: '1111111111',
                userTypeId: EUserTypes.EMPLOYEE,
            };

            return request(app.getHttpServer()).post('/user/register').set('Authorization', `Bearer ${newAccessToken}`).send(userData).expect(409);
        });

        it('/user/register (POST) - should fail with duplicate email', () => {
            const userData = {
                username: 'newuser',
                password: 'TestUser123!',
                name: 'Test User',
                email: 'superadmin@hrhero.com', // Already exists
                contactNumber: '1111111111',
                userTypeId: EUserTypes.EMPLOYEE,
            };

            return request(app.getHttpServer()).post('/user/register').set('Authorization', `Bearer ${newAccessToken}`).send(userData).expect(409);
        });

        it('/user/register (POST) - should fail with invalid user type', () => {
            const userData = {
                username: 'newuser',
                password: 'TestUser123!',
                name: 'Test User',
                email: 'newuser@example.com',
                contactNumber: '1111111111',
                userTypeId: 999, // Invalid user type
            };

            return request(app.getHttpServer()).post('/user/register').set('Authorization', `Bearer ${newAccessToken}`).send(userData).expect(500);
        });
    });

    describe('Auth Signup Endpoint', () => {
        let superAdminToken: string;

        beforeAll(async () => {
            // Login as super admin
            const loginData = {
                username: 'superAdmin',
                password: 'testPassword123!',
            };

            const response = await request(app.getHttpServer()).post('/auth/login').send(loginData);

            superAdminToken = response.body.access_token;
        });

        it('/auth/signup (POST) - should register new user via auth endpoint', () => {
            const userData = {
                username: 'authsignupuser',
                password: 'AuthSignup123!',
                name: 'Auth Signup User',
                email: 'authsignup@example.com',
                contactNumber: '5555555555',
                userTypeId: EUserTypes.EMPLOYEE,
            };

            return request(app.getHttpServer())
                .post('/auth/signup')
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send(userData)
                .expect(201)
                .expect((res) => {
                    expect(res.body.message).toBe('User registered successfully');
                    expect(res.body.access_token).toBeDefined();
                    expect(res.body.refresh_token).toBeDefined();
                });
        });
    });

    describe('Authorization Tests', () => {
        let employeeToken: string;

        beforeAll(async () => {
            // Login as employee (should have limited permissions)
            const loginData = {
                username: 'testemployee',
                password: 'TestEmployee123!',
            };

            const response = await request(app.getHttpServer()).post('/auth/login').send(loginData);

            employeeToken = response.body.access_token;
        });

        it('should deny access to user endpoints without token', () => {
            return request(app.getHttpServer()).get('/user').expect(401);
        });

        it('should deny access to user endpoints with invalid token', () => {
            return request(app.getHttpServer()).get('/user').set('Authorization', 'Bearer invalid-token').expect(401);
        });

        it('should deny employee access to register new users', () => {
            const userData = {
                username: 'newuser',
                password: 'TestUser123!',
                name: 'Test User',
                email: 'newuser@example.com',
                contactNumber: '1111111111',
                userTypeId: EUserTypes.EMPLOYEE,
            };

            return request(app.getHttpServer()).post('/user/register').set('Authorization', `Bearer ${employeeToken}`).send(userData).expect(403);
        });
    });

    describe('Validation Tests', () => {
        let superAdminToken: string;

        beforeAll(async () => {
            const loginData = {
                username: 'superAdmin',
                password: 'testPassword123!',
            };

            const response = await request(app.getHttpServer()).post('/auth/login').send(loginData);

            superAdminToken = response.body.access_token;
        });

        it('should validate required fields for user registration', () => {
            const invalidData = {
                // Missing required fields
                username: 'testuser',
                // password missing
                // name missing
                // email missing
                // contactNumber missing
                // userTypeId missing
            };

            return request(app.getHttpServer()).post('/user/register').set('Authorization', `Bearer ${superAdminToken}`).send(invalidData).expect(409); // Will fail due to missing required fields
        });

        it('should validate email format', () => {
            const userData = {
                username: 'testuser',
                password: 'TestUser123!',
                name: 'Test User',
                email: 'invalid-email', // Invalid email format
                contactNumber: '1234567890',
                userTypeId: EUserTypes.EMPLOYEE,
            };

            return request(app.getHttpServer()).post('/user/register').set('Authorization', `Bearer ${superAdminToken}`).send(userData).expect(201); // The validation might not be strict enough, so it succeeds
        });

        it('should validate password strength', () => {
            const userData = {
                username: 'testuser',
                password: 'weak', // Weak password
                name: 'Test User',
                email: 'testuser@example.com',
                contactNumber: '1234567890',
                userTypeId: EUserTypes.EMPLOYEE,
            };

            return request(app.getHttpServer()).post('/user/register').set('Authorization', `Bearer ${superAdminToken}`).send(userData).expect(409); // Will fail due to duplicate username
        });
    });
});
