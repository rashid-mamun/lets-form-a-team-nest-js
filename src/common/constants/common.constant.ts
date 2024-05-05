


export const SWAGGER_API_TAGS = {
    APP: 'APP',
    SEARCH: 'Search',
} as const;

export const SWAGGER_X_API_HEADER = [
    {
        name: 'x-api-key',
        description: 'concat the current time span(Asia/Dhaka) in milisecond and the api-key then use SHA256 encryption.',
    },
    {
        name: 'header-key',
        description: 'current time span(Asia/Dhaka) in milisecond but encrypt with alphabet',
    },
    {
        name: 'nonce',
        description: 'number of suffle of the encryped alphabets of the header-key',
    },
];
export const ApiResponseMessages = {
    SUCCESS: "Successful",
    FAILED: "Failed",
    INVALID_JWT: "Invalid JWT. Please include a proper JWT authorized key.",
    INVALID_USER_TYPE: "Invalid account type.",
    INVALID_USER: "Invalid user.",
    INVALID_EMAIL: (email: string) => `The email '${email}' does not exist.`,
    INVALID_LEAVE: "This leave entry is invalid.",
    USERNAME_PASSWORD_MISMATCH: "Username and password combination does not match.",
    USERNAME_ALREADY_EXISTS: (username: string) => `The username '${username}' already exists.`,
    EMAIL_ALREADY_EXISTS: (email: string) => `The email '${email}' already exists.`,
    UNAUTHORIZED_ACCESS: "Current user does not have access.",
    NO_OTHER_USER_ALLOWED: "We are currently not allowing other types of user registration.",
    NO_USERS: "There are no users at the moment.",
    SYSTEM_ERROR: "Sorry, something went wrong.",
    INVALID_POST_REQUEST: "Invalid POST request.",
    NO_USER_TYPE_MAP: "There was something wrong with your registration. Please contact the system admin.",
    ONLY_SUPER_ADMIN_CAN_REGISTER_MANAGER: "Only a Super Admin can register a manager.",
    EMPLOYEE_REGISTER_AUTHORIZATION: "Only a Super Admin or a Manager can register an Employee.",
};