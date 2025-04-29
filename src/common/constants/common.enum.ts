export enum HTTP_METHOD {
    POST = 'POST',
    GET = 'GET',
    PUT = 'PUT',
    DELETE = 'DELETE',
}
export enum EUserTypes {
    SUPER_ADMIN = 1,
    MANAGER = 2,
    EMPLOYEE = 3,
}

export const ApiResponseMessages = {
    DATA_FETCHED: 'Data fetched successfully',
    INVALID_CREDENTIALS: 'Invalid credentials',
    INVALID_TOKEN: 'Invalid token',
    INVALID_USER_TYPE: 'Invalid user type',
    UNAUTHORIZED_ACCESS: 'Unauthorized access',
    USERNAME_ALREADY_EXISTS: (username: string) => `Username ${username} already exists`,
    EMAIL_ALREADY_EXISTS: (email: string) => `Email ${email} already exists`,
    USER_NOT_FOUND: 'User not found',
    SEEDING_SUCCESS: 'Database seeded successfully',
    SEEDING_FAILED: 'Database seeding failed',
};
