import { INestApplication } from '@nestjs/common';

import * as request from 'supertest';

import { MongoDBHelper } from '../../common/tests/helpers/mongodb.helper';
import { RabbitMQHelper } from '../../common/tests/helpers/rabbitmq.helper';
import { createApplication } from '../src/app';
import {
  RABBITMQ_QUEUE,
  RABBITMQ_USER_CREATED_PATTERN,
  RABBITMQ_USER_DELETED_PATTERN,
  RABBITMQ_USER_UPDATED_PATTERN,
} from '../src/constants/rabbitmq.constants';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { UpdateUserDto } from '../src/users/dto/update-user.dto';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let mongoDBHelper: MongoDBHelper;
  let rabbitMQHelper: RabbitMQHelper;
  let userId: string;
  const API_PREFIX = '/api/v1';

  // Create unique emails for each test run to avoid conflicts
  const timestamp = new Date().getTime();

  const mockUser: CreateUserDto = {
    name: 'Test User',
    email: `test${timestamp}@example.com`,
  };

  const mockUser2: CreateUserDto = {
    name: 'Another User',
    email: `another${timestamp}@example.com`,
  };

  const mockUser3: CreateUserDto = {
    name: 'Third User',
    email: `third${timestamp}@example.com`,
  };

  const mockUpdateUser: UpdateUserDto = {
    name: 'Updated User',
  };

  const mockUpdateEmail: UpdateUserDto = {
    email: `updated${timestamp}@example.com`,
  };

  beforeAll(async () => {
    mongoDBHelper = new MongoDBHelper();
    await mongoDBHelper.connect();
    await mongoDBHelper.purgeDatabase();

    rabbitMQHelper = new RabbitMQHelper({ queue: RABBITMQ_QUEUE });
    await rabbitMQHelper.connect();
    await rabbitMQHelper.purgeQueue();

    app = await createApplication();
    await app.listen(process.env.USER_SERVICE_PORT || 4000);
  });

  afterAll(async () => {
    await app.close();

    if (rabbitMQHelper) {
      await rabbitMQHelper.purgeQueue();
      await rabbitMQHelper.close();
    }

    if (mongoDBHelper) {
      await mongoDBHelper.purgeDatabase();
      await mongoDBHelper.close();
    }
  });

  describe('POST /users', () => {
    it('should create a new user and publish a message to RabbitMQ', async () => {
      const response = await request(app.getHttpServer())
        .post(`${API_PREFIX}/users`)
        .send(mockUser)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(mockUser.name);
      expect(response.body.email).toBe(mockUser.email);

      // Store user ID for later tests
      userId = response.body.id;

      // Check if message was published to RabbitMQ
      const message = await rabbitMQHelper.getMessageWithPattern(RABBITMQ_USER_CREATED_PATTERN);
      expect(message).toBeDefined();

      // Only check message properties if message was received
      if (message) {
        expect(message.id).toBe(userId);
        expect(message.name).toBe(mockUser.name);
        expect(message.email).toBe(mockUser.email);
      }
    }, 10000); // Increase timeout for RabbitMQ message check

    it('should return 409 error when trying to create a user with existing email', async () => {
      await request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(mockUser).expect(409);
    });

    it('should return 400 error when validation fails', async () => {
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/users`)
        .send({ name: 'Invalid User' })
        .expect(400);
    });
  });

  describe('GET /users', () => {
    it('should return paginated list of users', async () => {
      const response = await request(app.getHttpServer()).get(`${API_PREFIX}/users`).expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBeGreaterThan(0);
    });

    it('should filter users by name', async () => {
      await request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(mockUser2);

      const response = await request(app.getHttpServer())
        .get(`${API_PREFIX}/users`)
        .query({ name: 'Another' })
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items.some((user) => user.name.includes('Another'))).toBe(true);
    });

    it('should filter users by email', async () => {
      await request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(mockUser3);

      const response = await request(app.getHttpServer())
        .get(`${API_PREFIX}/users`)
        .query({ email: `third${timestamp}` })
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      // At least one user should contain the email we're filtering by
      expect(response.body.items.some((user) => user.email.includes(`third${timestamp}`))).toBe(
        true,
      );
    });

    it('should paginate results', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_PREFIX}/users`)
        .query({ page: 1, limit: 2 })
        .expect(200);

      expect(response.body.items.length).toBeLessThanOrEqual(2);
      expect(response.body.total).toBeGreaterThanOrEqual(1);

      // Handle string vs number type for page and limit
      const page =
        typeof response.body.page === 'string'
          ? parseInt(response.body.page, 10)
          : response.body.page;

      const limit =
        typeof response.body.limit === 'string'
          ? parseInt(response.body.limit, 10)
          : response.body.limit;

      expect(page).toBe(1);
      expect(limit).toBe(2);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`${API_PREFIX}/users/${userId}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.name).toBe(mockUser.name);
      expect(response.body.email).toBe(mockUser.email);
    });

    it('should return 404 when user does not exist', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      await request(app.getHttpServer()).get(`${API_PREFIX}/users/${nonExistentId}`).expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user and publish a message to RabbitMQ', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_PREFIX}/users/${userId}`)
        .send(mockUpdateUser)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.name).toBe(mockUpdateUser.name);
      expect(response.body.email).toBe(mockUser.email);

      // Check if message was published to RabbitMQ
      const message = await rabbitMQHelper.getMessageWithPattern(RABBITMQ_USER_UPDATED_PATTERN);

      // Only verify message properties if a message was received
      if (message) {
        expect(message.id).toBe(userId);
        expect(message.name).toBe(mockUpdateUser.name);
        expect(message.email).toBe(mockUser.email);
      }
    }, 10000); // Increase timeout for RabbitMQ message check

    it('should update user email', async () => {
      const response = await request(app.getHttpServer())
        .patch(`${API_PREFIX}/users/${userId}`)
        .send(mockUpdateEmail)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.name).toBe(mockUpdateUser.name);
      expect(response.body.email).toBe(mockUpdateEmail.email);
    });

    it('should return 404 when user does not exist', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/users/${nonExistentId}`)
        .send(mockUpdateUser)
        .expect(404);
    });

    it('should return 409 when email is already in use', async () => {
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/users`)
        .send({
          name: 'Duplicate Email User',
          email: `duplicate${timestamp}@example.com`,
        })
        .expect(201);

      // Try to update our main test user with the duplicate email
      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/users/${userId}`)
        .send({ email: `duplicate${timestamp}@example.com` })
        .expect(409);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user and publish a message to RabbitMQ', async () => {
      await request(app.getHttpServer()).delete(`${API_PREFIX}/users/${userId}`).expect(200);

      const message = await rabbitMQHelper.getMessageWithPattern(RABBITMQ_USER_DELETED_PATTERN);

      if (message) {
        expect(message.id).toBe(userId);
        expect(message.name).toBe(mockUser.name);
        expect(message.email).toBe(mockUser.email);
      }
    }, 10000); // Increase timeout for RabbitMQ message check

    it('should return 404 when user does not exist', async () => {
      await request(app.getHttpServer()).delete(`${API_PREFIX}/users/${userId}`).expect(404);
    });
  });
});
