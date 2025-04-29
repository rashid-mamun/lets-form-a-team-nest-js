import { ApiResponseMessages } from './common.enum';

export const SWAGGER_API_TAGS = {
    APP: 'App',
    SEARCH: 'Search',
    AUTH: 'Authentication',
    USER: 'User Management',
    SEEDER: 'Database Seeding',
} as const;

export const SWAGGER_X_API_HEADER = [
    {
        name: 'x-api-key',
        description: 'Concat the current timestamp (Asia/Dhaka) in milliseconds and the api-key, then use SHA256 encryption.',
    },
    {
        name: 'header-key',
        description: 'Current timestamp (Asia/Dhaka) in milliseconds, encrypted with alphabet.',
    },
    {
        name: 'nonce',
        description: 'Number of shuffles of the encrypted alphabets of the header-key.',
    },
];

export { ApiResponseMessages };
