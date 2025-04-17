import * as Joi from 'joi';
import * as dotenv from 'dotenv';
dotenv.config();
export const APP_CONFIG = {
    APP_ENV: process.env.APP_ENV || 'development',
    APP_PORT: parseInt(process.env.APP_PORT || '3000', 10),
    THROTTLER: {
        TTL: parseInt(process.env.THROTTLE_TTL || '60', 10),
        LIMIT: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
    },
    X_API_KEY: process.env.X_API_KEY,
    X_API_ACCEPT_TTL: parseInt(process.env.X_API_ACCEPT_TTL || '30000', 10),
    TYPE_ORM: {
        HOST: process.env.DB_HOST || 'localhost',
        PORT: parseInt(process.env.DB_PORT || '3306', 10),
        USER_NAME: process.env.DB_USERNAME || 'super_admin',
        PASSWORD: process.env.DB_PASSWORD || 'superadmin',
        DATABASE: process.env.DB_DATABASE || 'lets_form_a_team',
        MIGRATIONS_TABLE_NAME: 'migration',
        ENTITIES: [__dirname + '/../../dataModules/**/**/*.entity.{js,ts}'],
        CLI: {
            MIGRATIONS_DIR: 'src/migration',
        },
        SYNCHRONIZE: process.env.DB_SYNC === 'true' ? true : false,
        DEBUG: process.env.DB_DEBUG === 'true' ? true : false,
    },
    REDIS: {
        HOST: process.env.REDIS_HOST || 'localhost',
        PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD || 'secure_default_password',
};

export const AppConfigSchema = Joi.object({
    APP_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    APP_PORT: Joi.number().default(3000),
    THROTTLER: Joi.object({
        TTL: Joi.number().required(),
        LIMIT: Joi.number().required(),
    }),
    X_API_KEY: Joi.string().required(),
    X_API_ACCEPT_TTL: Joi.number().default(30000),
    TYPE_ORM: Joi.object({
        HOST: Joi.string().required(),
        PORT: Joi.number().required(),
        USER_NAME: Joi.string().required(),
        PASSWORD: Joi.string().required(),
        DATABASE: Joi.string().required(),
        MIGRATIONS_TABLE_NAME: Joi.string().required(),
        ENTITIES: Joi.array().required(),
        CLI: Joi.object({
            MIGRATIONS_DIR: Joi.string().required(),
        }),
        SYNCHRONIZE: Joi.boolean().default(false),
        DEBUG: Joi.boolean().default(false),
    }),
    REDIS: Joi.object({
        HOST: Joi.string().default('localhost'),
        PORT: Joi.number().default(6379),
    }),
    SUPER_ADMIN_PASSWORD: Joi.string().required(),
});
