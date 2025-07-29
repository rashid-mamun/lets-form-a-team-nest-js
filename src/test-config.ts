// Test configuration to ensure proper environment setup
import { APP_CONFIG } from './common/configs/app.config';

// Override config for tests
export const TEST_CONFIG = {
    ...APP_CONFIG,
    SUPER_ADMIN_PASSWORD: 'testPassword123!',
    JWT_SECRET: 'test-jwt-secret-key',
    JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-key',
    TYPE_ORM: {
        ...APP_CONFIG.TYPE_ORM,
        SYNCHRONIZE: true, // Enable sync for tests
        DATABASE: 'test_lets_form_a_team',
    },
    REDIS: {
        ...APP_CONFIG.REDIS,
        HOST: 'localhost',
        PORT: 6379,
    },
};

// Set environment variables for tests
process.env.SUPER_ADMIN_PASSWORD = TEST_CONFIG.SUPER_ADMIN_PASSWORD;
process.env.JWT_SECRET = TEST_CONFIG.JWT_SECRET;
process.env.JWT_REFRESH_SECRET = TEST_CONFIG.JWT_REFRESH_SECRET;
process.env.DB_DATABASE = TEST_CONFIG.TYPE_ORM.DATABASE;
process.env.DB_SYNC = 'true';
