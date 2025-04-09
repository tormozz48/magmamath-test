# MagmaMath Backend Developer Task

## Overview

The objective of this task is to assess the candidate's proficiency in building backend services using Node.js, TypeScript, Docker, and associated technologies. The task is designed to measure the candidate's understanding of microservices architecture and communication between them.

## Task Description

Build a microservices-based application with two services - User Service and Notification Service.

### 1. Setup & Configuration

- Set up a new Node.js project using TypeScript.
- Use Docker to containerize the services.
- Use docker-compose for orchestration of your microservices.

### 2. User Service

- Implement CRUD operations for a user entity that includes fields: id, name, email, and createdAt.
- Use MongoDB as a datastore for the user entity.
- Validate the input data using appropriate libraries or utilities.
- Implement pagination for the GET method that retrieves users.

### 3. Notification Service

- Consume messages from the message broker.
- Whenever a user is created, send a mock notification (console log) welcoming the user.
- Whenever a user is deleted, send a mock notification (console log) informing about the deletion.

### 4. Message Broker

- Use a message broker of your choice (e.g., RabbitMQ, Kafka).

### 5. Additional Considerations

- Implement proper error handling for both services.
- Implement health checks in each service.
- Implement a logger.

## Deliverables

A GitHub repository containing:

- The source code for both microservices.
- Docker and docker-compose configuration files.

## Notes

- It is fine to use third-party libraries/packages, but do ensure you understand how they work and are able to explain your choices.
- The primary objective is to evaluate your backend design and coding skills.
- If certain parts of the task seem ambiguous, do as you see fit.
- You have 3 working days to complete the task.
- Send the link to the GitHub repository to:
  - <anton.makouski@magmamath.com>
  - <mattias@magmamath.com>
- The repository must be public (do not send an invitation to collaborate)
- If the task is not completed completely, please send us what you managed to implement.

**Good luck, and we're excited to see your solution!**
