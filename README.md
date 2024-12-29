# Let's Form a Team

An Account Type-Based Authorization/Authentication System using NestJS, MySQL, and TypeORM

## Project Setup

### Setting up the Database

1. Switch to the MySQL command line:
    ```bash
    mysql -u root -p
    ```
2. Create the database:
    ```sql
    CREATE DATABASE hr_hero_db;
    ```
3. Create a user with an encrypted password:
    ```sql
    CREATE USER 'super_admin'@'localhost' IDENTIFIED BY 'superadmin';
    ```
4. Grant all privileges to the created user:
    ```sql
    GRANT ALL PRIVILEGES ON hr_hero_db.* TO 'super_admin'@'localhost';
    ```
5. Flush the privileges to ensure they are saved and available in the current session:
    ```sql
    FLUSH PRIVILEGES;
    ```

### Setting up the Project

1. Clone the repository:
    ```bash
    git clone https://github.com/rashid-mamun/lets-form-a-team-nest-js.git
    ```
2. Navigate to the project directory:
    ```bash
    cd lets-form-a-team-nest-js
    ```
3. Install dependencies:
    ```bash
    npm
    ```
4. Set up the environment variables. Create a `.env` file in the project root and add the following:
    ```env
    APP_ENV = development
    APP_PORT = 3000
    JWT_SECRET='jwt secret key'
    JWT_ACCESS_TOKEN_EXPIRATION=15m
    JWT_REFRESH_TOKEN_EXPIRATION=15d
    DB_HOST=localhost
    DB_PORT=3306
    DB_USERNAME=root
    DB_PASSWORD= root
    DB_DATABASE= lets_form_a_team
    DB_SYNC=true
    ```
5. Start the development server:
    ```bash
    npm run start:dev
    ```

### Running the Seeder API

This API helps in seeding the initial requirements, which include creating specific account types and a super admin. This can be automated.

**URL** (POST REQUEST): `http://127.0.0.1:3000/api/core/seeder`

### Account Types

- Super Admin: 1
- Manager: 2
- Employee: 3

## Authentication and Authorization

### Login

**URL**: `http://127.0.0.1:3000/api/core/login/`

**Sample POST Request:**
```json
{
    "username": "superAdmin",
    "password": "super_admin1"
}
```

**Sample Response:**
```json
{
    "message": "Successful",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "profile": {
        "id": 1,
        "name": "Super Admin",
        "contactNumber": "01837645524",
        "email": "",
        "createdAt": "2022-08-31T16:25:59.318Z",
        "updatedAt": "2022-08-31T16:25:59.318Z",
        "userId": 1,
        "createdBy": null,
        "updatedBy": null
    }
}
```

Use this access token in requests that require authorization. The Authorization header must be set like this:
```
Authorization: jwt <accessToken>
```

### Refresh Access Token

**URL**: `http://127.0.0.1:3000/api/core/refresh-token/`

**Sample POST Request:**
```json
{
    "accessToken": "jwt <accessToken>"
}
```

**Sample Response:**
```json
{
    "status": 200,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires": "in 2 days"
}
```

### Register Manager

Only a super admin can add a manager.

**URL**: `http://127.0.0.1:3000/api/core/register/user-profile/`

**Sample POST Request:**
```json
{
    "username": "manager1",
    "password": "Manager1",
    "name": "John Manager",
    "contactNumber": "01789652243",
    "email": "john@hrhero.com",
    "accountType": 2
}
```

**Sample Response:**
```json
{
    "message": "Successful",
    "data": {
        "id": 1,
        "username": "manager1",
        "name": "John Manager",
        "contactNumber": "01789652243",
        "email": "john@hrhero.com",
        "accountType": "Manager"
    }
}
```

### Register Employee

A super admin or a manager can add an employee.

**URL** (POST REQUEST): `http://127.0.0.1:3000/api/core/register/user-profile/`

**Sample POST Request:**
```json
{
    "username": "harryMaguire",
    "password": "Defender1",
    "name": "Harry Maguire",
    "contactNumber": "01789353343",
    "email": "harry@hrhero.com",
    "accountType": 3
}
```

**Sample Response:**
```json
{
    "message": "Successful",
    "data": {
        "id": 17,
        "username": "harryMaguire",
        "name": "Harry Maguire",
        "contactNumber": "01789353343",
        "email": "harry@hrhero.com",
        "accountType": "Employee"
    }
}
```

### Get All Users

**URL** (GET REQUEST): `http://127.0.0.1:3000/api/core/get-users/`

**Sample Response:**
```json
{
    "message": "Successful",
    "data": [
        {
            "id": 2,
            "name": "Super Admin",
            "contactNumber": "01837645524",
            "email": "",
            "createdAt": "2022-08-27T10:08:57.452Z",
            "updatedAt": "2022-08-27T10:08:57.452Z",
            "userId": 2,
            "createdBy": null,
            "updatedBy": null
        },
        {
            "id": 1,
            "name": "John Manager",
            "contactNumber": "01789652243",
            "email": "john@hrhero.com",
            "createdAt": "2022-08-27T10:01:49.739Z",
            "updatedAt": "2022-08-27T10:01:49.739Z",
            "userId": 1,
            "createdBy": 2,
            "updatedBy": 2
        },
        {
            "id": 16,
            "name": "Scott Mctominay",
            "contactNumber": "01789653343",
            "email": "scott@hrhero.com",
            "createdAt": "2022-08-27T12:20:31.003Z",
            "updatedAt": "2022-08-27T12:20:31.003Z",
            "userId": 24,
            "createdBy": 2,
            "updatedBy": 2
        },
        {
            "id": 17,
            "name": "Harry Maguire",
            "contactNumber": "01789353343",
            "email": "harry@hrhero.com",
            "createdAt": "2022-08-27T12:23:02.423Z",
            "updatedAt": "2022-08-27T12:23:02.423Z",
            "userId": 25,
            "createdBy": 2,
            "updatedBy": 2
        }
    ]
}
```

### Get User by ID

**URL** (GET REQUEST): `http://127.0.0.1:3000/api/core/get-user/?id=1`

**Sample Response:**
```json
{
    "message": "Successful",
    "data": {
        "id": 1,
        "name": "John Manager",
        "contactNumber": "01789652243",
        "email": "john@hrhero.com",
        "createdAt": "2022-08-27T10:01:49.739Z",
        "updatedAt": "2022-08-27T10:01:49.739Z",
        "userId": 1,
        "createdBy": 2,
        "updatedBy": 2
    }
}
```