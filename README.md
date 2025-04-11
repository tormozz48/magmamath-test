# MagmaMath Test Project

A microservices-based application consisting of a User Service and Notification Service that communicate via RabbitMQ. This project was developed as part of the [MagmaMath Backend Developer Task](./task.md).

## Docker Deployment

The entire application can be run using Docker Compose, which will set up all services with their dependencies:

```bash
# Copy example environment file if you haven't already
cp .env.example .env

# Start all services (MongoDB, RabbitMQ, User Service, Notification Service)
docker-compose up -d
```

This will:

1. Build and start the User Service container
2. Build and start the Notification Service container
3. Start MongoDB container
4. Start RabbitMQ container
5. Configure all necessary network connections between services

You can then access:

- User Service API at [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- User Service Swagger docs at [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- Notification Service at [http://localhost:4001](http://localhost:4001)
- RabbitMQ Management UI at [http://localhost:15672](http://localhost:15672) (default credentials: guest/guest)

To stop all services:

```bash
docker-compose down
```

## Project Structure

The project is organized into three main directories:

- **user**: User service built with NestJS, handling user CRUD operations with MongoDB
- **notification**: Notification service built with NestJS, handling user event notifications via RabbitMQ
- **common**: Shared code and utilities used by both services

## Features

### User Service Features

- RESTful API for user management (create, read, update, delete)
- MongoDB integration for data persistence
- Health check endpoint that monitors MongoDB and RabbitMQ connections
- Event publishing to RabbitMQ for user lifecycle events

### Notification Service Features

- Event-driven architecture using RabbitMQ
- Processes user events (created, updated, deleted)
- Simulates sending email notifications
- Health check endpoint that monitors RabbitMQ connection

## Prerequisites

- Node.js v20 or later
- MongoDB
- RabbitMQ

## Installation

```bash
# Install dependencies
npm ci --legacy-peer-deps
```

## Environment Variables

The project includes an `.env.example` file with all the required environment variables. Copy this file to create your own `.env` file:

```bash
# Copy example environment file
cp .env.example .env

# Edit the .env file with your specific configuration if needed
```

Key environment variables include:

- `MONGODB_URI`: MongoDB connection string
- `RABBITMQ_URI`: RabbitMQ connection string
- `USER_SERVICE_PORT`: Port for the User service
- `NOTIFICATION_SERVICE_PORT`: Port for the Notification service

For testing, you may want to use a separate database by modifying the MongoDB URI in your `.env` file.

## Running the Application

### Docker Services

Before running the application or tests, you need to start the required services (MongoDB and RabbitMQ) using Docker Compose:

```bash
# Start MongoDB and RabbitMQ services
docker-compose -f docker-compose.dev.yml up -d
```

This will start:

- MongoDB service on the configured port (default: 27017)
- RabbitMQ service on the configured port (default: 5672)
- RabbitMQ Management UI on the configured port (default: 15672)

### Development Mode

```bash
# Start User Service
npm run user:start:dev

# Start Notification Service
npm run notification:start:dev
```

### Production Mode

```bash
# Build both services
npm run build

# Start User Service
npm run user:start:prod

# Start Notification Service
npm run notification:start:prod
```

### End-to-End Tests

Before running tests, make sure MongoDB and RabbitMQ services are running via Docker Compose as described above.

```bash
# User Service E2E Tests
npm run user:test:e2e

# Notification Service E2E Tests
npm run notification:test:e2e
```

## CI/CD

The project uses GitHub Actions for continuous integration. The workflow includes:

1. **Linting**: Runs ESLint checks on the codebase
2. **User Service**: Builds the user service and runs end-to-end tests with MongoDB and RabbitMQ services
3. **Notification Service**: Builds the notification service and runs end-to-end tests with RabbitMQ service

## API Documentation

The User Service provides Swagger documentation for easy API exploration and testing.

### Swagger UI

When the User Service is running, you can access the Swagger UI at:

```text
http://localhost:4000/api/docs
```

This interactive documentation allows you to:

- View all available endpoints
- Test API calls directly from the browser
- See request/response schemas
- Understand authentication requirements

## Event Patterns

The following RabbitMQ event patterns are used for communication between services:

- `user.created`: Published when a new user is created
- `user.updated`: Published when a user is updated
- `user.deleted`: Published when a user is deleted

## License

ISC
