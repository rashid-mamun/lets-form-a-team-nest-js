# Let's Form A Team - NestJS Backend

## 📋 Description

A robust **Account type-based authentication and authorization system** built with NestJS. This application provides a complete user management system with role-based access control, featuring Super Admin, Manager, and Employee user types. The system includes JWT-based authentication, comprehensive API endpoints, and extensive testing coverage.

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (Super Admin, Manager, Employee)
- **Token blacklisting** for secure logout
- **Password hashing** with bcrypt
- **Rate limiting** for API protection

### 👥 User Management
- **User registration** with role assignment
- **User profile management** (name, email, contact)
- **User type mapping** and permissions
- **Comprehensive validation** and error handling

### 🗄️ Database & Infrastructure
- **MySQL database** with TypeORM
- **Redis caching** for token management
- **Database seeding** for initial setup
- **Transaction management** for data integrity


## 🛠️ Technologies Used

### Backend Framework
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Express** - Web application framework

### Database & Caching
- **MySQL** - Relational database
- **TypeORM** - Object-Relational Mapping
- **Redis** - In-memory data store

### Authentication & Security
- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing
- **class-validator** - Input validation

### Development Tools
- **Jest** - Testing framework
- **Swagger** - API documentation
- **ESLint & Prettier** - Code formatting
- **Husky** - Git hooks

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Redis (v6.0 or higher)
- npm or yarn

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
    git clone https://github.com/rashid-mamun/lets-form-a-team-nest-js
    cd lets-form-a-team-nest-js
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE lets_form_a_team;
   ```

5. **Start Redis server**
   ```bash
   redis-server
   ```

6. **Run database migrations (if any)**
   ```bash
   npm run migration:run
   ```

7. **Seed the database**
   ```bash
   npm run start:dev
   # Then make a POST request to /seeder endpoint
   ```

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
APP_ENV=development
APP_PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=super_admin
DB_PASSWORD=superadmin
DB_DATABASE=lets_form_a_team
DB_SYNC=true
DB_DEBUG=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_TOKEN_EXPIRATION=15m
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Security
X_API_KEY=your-api-key
X_API_ACCEPT_TTL=30000
SUPER_ADMIN_PASSWORD=secure_default_password

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

## 🏃‍♂️ Running the Project

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

## 📚 API Endpoints

### 🔐 Authentication Endpoints

#### POST `/auth/login`
Login with username and password.

**Request:**
```json
{
  "username": "superAdmin",
  "password": "testPassword123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "superAdmin",
    "roles": [1]
  }
}
```

#### POST `/auth/logout`
Logout and blacklist refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

#### POST `/auth/refresh`
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/auth/signup`
Register a new user (requires authentication).

**Request:**
```json
{
  "username": "newuser",
  "password": "password123",
  "name": "New User",
  "email": "newuser@example.com",
  "contactNumber": "1234567890",
  "userTypeId": 2
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 👥 User Management Endpoints

#### GET `/user`
Get all users (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "username": "superAdmin",
    "profile": {
      "name": "Super Admin",
      "email": "superadmin@hrhero.com",
      "contactNumber": "0000000000"
    }
  }
]
```

#### GET `/user/id?id=1`
Get user by ID (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "username": "superAdmin",
  "profile": {
    "name": "Super Admin",
    "email": "superadmin@hrhero.com",
    "contactNumber": "0000000000"
  }
}
```

#### POST `/user/register`
Register a new user (requires appropriate permissions).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "username": "manager1",
  "password": "password123",
  "name": "Manager One",
  "email": "manager1@example.com",
  "contactNumber": "1234567890",
  "userTypeId": 2
}
```

**Response:**
```json
{
  "id": 2,
  "username": "manager1",
  "profile": {
    "name": "Manager One",
    "email": "manager1@example.com",
    "contactNumber": "1234567890"
  }
}
```

### 🗄️ System Endpoints

#### GET `/`
Welcome message.

**Response:**
```
welcome to lets-form-a-team
```

#### GET `/health-check`
Health status check.

**Response:**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  }
}
```

#### POST `/seeder`
Seed the database with initial data.

**Response:**
```json
{
  "message": "Database seeded successfully",
  "data": true
}
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test -- --testPathPattern=".spec.ts" --testPathIgnorePatterns="e2e"
```

### Run E2E Tests Only
```bash
npm run test -- --testPathPattern="e2e"
```

### Run Tests with Coverage
```bash
npm run test:cov
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```


## 🔐 User Types & Permissions

### Super Admin (Type ID: 1)
- Can create managers and employees
- Full access to all endpoints
- Can manage all users

### Manager (Type ID: 2)
- Can create employees
- Limited access to user management
- Cannot create other managers

### Employee (Type ID: 3)
- Basic user access
- Cannot create other users
- Limited to personal operations

## 🚀 Deployment

### Docker (Recommended)
```bash
# Build the image
docker build -t lets-form-a-team .

# Run with docker-compose
docker-compose up -d
```

### Manual Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Start the application: `npm run start:prod`
4. Use a process manager like PM2 for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request
