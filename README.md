# Let's Form a Team - NestJS
Welcome to **Let's Form a Team**, a powerful NestJS application for user authentication and role-based management. With support for Super Admin, Manager, and Employee roles, it offers secure JWT authentication, Redis token blacklisting, MySQL storage, and Dockerized deployment. Featuring Swagger documentation, rate limiting, and comprehensive testing, this project is built for scalability and ease of use.

## Features 🚀
- **Secure Authentication**: JWT-based login with access and refresh tokens.
- **Role-Based Access**: Manage Super Admin, Manager, and Employee roles.
- **User Management**: Create, retrieve, and update user profiles.
- **Redis Integration**: Blacklist tokens for secure logout.
- **MySQL Database**: Store data with TypeORM for reliability.
- **Swagger Documentation**: Explore APIs interactively at `/api-doc`.
- **Rate Limiting**: Protect endpoints with throttling.
- **Testing Suite**: Unit and E2E tests using Jest.
- **Docker Support**: Simplified deployment with Docker Compose.
- **Centralized Logging**: Track activity with Pino logger.
- **Security First**: Password hashing (bcrypt), input validation (class-validator).


## Prerequisites 📋
Ensure you have the following installed:
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **MySQL**: v8.0 or higher (local setup)
- **Redis**: v7.0 or higher (local setup)
- **Docker**: Latest version (optional, for containers)
- **Git**: For cloning the repository

## Installation 🔧
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/rashid-mamun/lets-form-a-team-nest-js
   cd lets-form-a-team-nest-js
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

## Environment Setup ⚙️
1. **Copy Environment File**:
   ```bash
   cp .env.example .env
   ```

2. **Configure `.env`**:
   Update `.env` with your settings.
3. **Secure Credentials**:
   - Use strong, unique values for `JWT_SECRET`, `X_API_KEY`, and `SUPER_ADMIN_PASSWORD`.

## Running the Application ▶️
### Getting Started
1. **Start Development Server**:
   ```bash
   npm run start:dev
   ```
   The app runs at `http://localhost:3000`.

2. **Seed the Database**:
   Initialize with a Super Admin user:
   ```bash
   curl -X POST http://localhost:3000/api/seeder
   ```

3. **Explore APIs**:
   Access Swagger documentation:
   ```
   http://localhost:3000/api-doc
   ```

## Deployment with Docker 🐳
1. **Start Containers**:
   ```bash
   docker-compose up -d
   ```

2. **Verify Containers**:
   ```bash
   docker ps
   ```

3. **Seed Database**:
   ```bash
   curl -X POST http://localhost:3000/api/seeder
   ```

4. **Stop Containers**:
   ```bash
   docker-compose down
   ```

**Notes**:
- `Dockerfile`: Builds a production image.
- `docker-compose.yml`: Configures app, MySQL, and Redis.
- Ensure `.env` is set up for containerized environments.

## API Endpoints 📖
All endpoints (except health check) are prefixed with `/api`. Use Swagger UI (`http://localhost:3000/api-doc`) for interactive testing. Below are request and response samples.

### Health Check
- **Endpoint**: `GET /api`
- **Description**: Verify application status.
- **Request**:
  ```bash
  curl http://localhost:3000/api/
  ```
- **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "messsage": "data fetched",
    "data": "welcome to lets-form-a-team"
  }
  ```

### Authentication (`/api/auth`)
#### 1. Signup
- **Endpoint**: `POST /api/auth/signup`
- **Description**: Register a new user.
- **Request**:
  ```bash
  curl -X POST http://localhost:3000/api/auth/signup \
    -H "Content-Type: application/json" \
    -d '{
      "username": "manager1",
      "password": "manager123",
      "name": "John Manager",
      "email": "john@hrhero.com",
      "contactNumber": "01789652243",
      "userTypeId": 2,
      "userId": 1
    }'
  ```
- **Success Response** (201 Created):
  ```json
  {
    "success": true,
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "message": "Request successful"
  }
  ```
#### 2. Login
- **Endpoint**: `POST /api/auth/login`
- **Description**: Obtain access and refresh tokens.
- **Request**:
  ```bash
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "username": "superAdmin",
      "password": "your_secure_password"
    }'
  ```
- **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "message": "Request successful"
  }
  ```

#### 3. Logout
- **Endpoint**: `POST /api/auth/logout`
- **Description**: Blacklist a refresh token (requires JWT).
- **Request**:
  ```bash
  curl -X POST http://localhost:3000/api/auth/logout \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <access_token>" \
    -d '{"refresh_token": "<refresh_token>"}'
  ```
- **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "data": null,
    "message": "Request successful"
  }
  ```

#### 4. Refresh Token
- **Endpoint**: `POST /api/auth/refresh`
- **Description**: Refresh an access token.
- **Request**:
  ```bash
  curl -X POST http://localhost:3000/api/auth/refresh \
    -H "Content-Type: application/json" \
    -d '{"refresh_token": "<refresh_token>"}'
  ```
- **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "message": "Request successful"
  }
  ```

### User Management (`/api/user`)
**Note**: Requires JWT in `Authorization: Bearer <access_token>`.

#### 1. Register User
- **Endpoint**: `POST /api/user/register`
- **Description**: Register a Manager or Employee (requires appropriate role).
- **Request**:
  ```bash
  curl -X POST http://localhost:3000/api/user/register \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <access_token>" \
    -d '{
      "username": "employee1",
      "password": "employee123",
      "name": "Jane Employee",
      "email": "jane@hrhero.com",
      "contactNumber": "01789652244",
      "userTypeId": 3,
      "userId": 1
    }'
  ```
- **Success Response** (201 Created):
  ```json
  {
    "success": true,
    "data": {
      "id": 2,
      "username": "employee1",
      "name": "Jane Employee",
      "contactNumber": "01789652244",
      "email": "jane@hrhero.com",
      "userTypeId": 3
    },
    "message": "Request successful"
  }
  ```

#### 2. Get All Users
- **Endpoint**: `GET /api/user`
- **Description**: List all users.
- **Request**:
  ```bash
  curl -X GET http://localhost:3000/api/user \
    -H "Authorization: Bearer <access_token>"
  ```
- **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "username": "superAdmin",
        "createdAt": "2025-04-17T10:00:00.000Z",
        "updatedAt": "2025-04-17T10:00:00.000Z"
      },
      {
        "id": 2,
        "username": "employee1",
        "createdAt": "2025-04-17T10:01:00.000Z",
        "updatedAt": "2025-04-17T10:01:00.000Z"
      }
    ],
    "message": "Request successful"
  }
  ```

#### 3. Get User by ID
- **Endpoint**: `GET /api/user/id?id=<id>`
- **Description**: Retrieve a user by ID.
- **Request**:
  ```bash
  curl -X GET http://localhost:3000/api/user/id?id=1 \
    -H "Authorization: Bearer <access_token>"
  ```
- **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "username": "superAdmin",
      "createdAt": "2025-04-17T10:00:00.000Z",
      "updatedAt": "2025-04-17T10:00:00.000Z"
    },
    "message": "Request successful"
  }
  ```

### Seeder (`/api/seeder`)
#### Seed Database
- **Endpoint**: `POST /api/seeder`
- **Description**: Initialize database with user types and Super Admin.
- **Request**:
  ```bash
  curl -X POST http://localhost:3000/api/seeder
  ```
- **Success Response** (200 OK):
  ```json
  {
    "success": true,
    "messsage": "Database seeded successfully",
    "data": {
        "data": true
    }
  }
  ```

**Note**: For protected endpoints (`/api/user/*`, `/api/auth/logout`), obtain an `access_token` via `/api/auth/login` or `/api/auth/signup`. Replace `<access_token>` and `<refresh_token>` with actual tokens.

## Testing ✅
Run unit and end-to-end (E2E) tests with Jest.

1. **All Tests**:
   ```bash
   npm run test
   ```

2. **E2E Tests**:
   ```bash
   npm run test:e2e
   ```

3. **Coverage Report**:
   ```bash
   npm run test:cov
   ```

4. **Test Files**:
   - Unit: `test/auth.service.spec.ts`
   - E2E: `test/auth.e2e-spec.ts`

**Note**: Ensure MySQL and Redis are running for E2E tests.
