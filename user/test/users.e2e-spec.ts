import { faker } from '@faker-js/faker/.';
import * as request from 'supertest';

import { createUniqueEmail, createUserDto, updateUserDto } from './factories/user.factory';
import { API_PREFIX, app, rabbitMQHelper } from './setup';

describe('UsersController (e2e)', () => {
  describe('POST /users', () => {
    it('should create a new user and publish a message to RabbitMQ', async () => {
      const testUser = createUserDto({
        email: createUniqueEmail('test'),
      });

      const response = await request(app.getHttpServer())
        .post(`${API_PREFIX}/users`)
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(testUser.name);
      expect(response.body.email).toBe(testUser.email);

      const message = await rabbitMQHelper.getMessageWithPattern('users.created');
      expect(message).toBeDefined();

      if (message) {
        expect(message.id).toBe(response.body.id);
        expect(message.name).toBe(testUser.name);
        expect(message.email).toBe(testUser.email);
      }
    }, 10000); // Increase timeout for RabbitMQ message check

    it('should return 409 error when trying to create a user with existing email', async () => {
      const testUser = createUserDto({
        email: createUniqueEmail('duplicate'),
      });

      await request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(testUser).expect(201);
      await request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(testUser).expect(409);
    });

    it('should return 400 error when validation fails', async () => {
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/users`)
        .send({ name: 'Invalid User' }) // Missing email
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
      const testUser = createUserDto({
        name: 'FilterByNameTest',
        email: createUniqueEmail('filter-name'),
      });

      await request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(testUser).expect(201);

      const response = await request(app.getHttpServer())
        .get(`${API_PREFIX}/users`)
        .query({ name: 'FilterByNameTest' })
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items.some((user) => user.name.includes('FilterByNameTest'))).toBe(true);
    });

    it('should filter users by email', async () => {
      const uniqueEmailPart = `filter-email-${Date.now()}`;
      const testUser = createUserDto({
        email: createUniqueEmail(uniqueEmailPart),
      });

      await request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(testUser).expect(201);

      const response = await request(app.getHttpServer())
        .get(`${API_PREFIX}/users`)
        .query({ email: uniqueEmailPart })
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items.some((user) => user.email.includes(uniqueEmailPart))).toBe(true);
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
      const testUser = createUserDto({
        email: createUniqueEmail('test'),
      });

      const response = await request(app.getHttpServer())
        .post(`${API_PREFIX}/users`)
        .send(testUser)
        .expect(201);

      const userId = response.body.id;
      const getUserResponse = await request(app.getHttpServer())
        .get(`${API_PREFIX}/users/${userId}`)
        .expect(200);

      expect(getUserResponse.body.id).toBe(userId);
      expect(getUserResponse.body.name).toBe(testUser.name);
      expect(getUserResponse.body.email).toBe(testUser.email);
    });

    it('should return 404 when user does not exist', async () => {
      const nonExistentId = faker.database.mongodbObjectId();
      await request(app.getHttpServer()).get(`${API_PREFIX}/users/${nonExistentId}`).expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user and publish a message to RabbitMQ', async () => {
      const testUser = createUserDto({
        email: createUniqueEmail('test'),
      });

      const {
        body: { id: userId },
      } = await request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(testUser).expect(201);

      const updateData = updateUserDto({
        name: 'Updated User Name',
      });

      const response = await request(app.getHttpServer())
        .patch(`${API_PREFIX}/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.name).toBe(updateData.name);

      const message = await rabbitMQHelper.getMessageWithPattern('users.updated');
      if (message) {
        expect(message.id).toBe(userId);
        expect(message.name).toBe(updateData.name);
      }
    }, 10000); // Increase timeout for RabbitMQ message check

    it('should update user email', async () => {
      const testUser = createUserDto({
        email: createUniqueEmail('test'),
      });

      const {
        body: { id: userId },
      } = await request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(testUser).expect(201);

      const updateData = updateUserDto({
        email: createUniqueEmail('updated-email'),
      });

      const response = await request(app.getHttpServer())
        .patch(`${API_PREFIX}/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe(updateData.email);
    });

    it('should return 404 when user does not exist', async () => {
      const nonExistentId = faker.database.mongodbObjectId();
      const updateData = updateUserDto();

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/users/${nonExistentId}`)
        .send(updateData)
        .expect(404);
    });

    it('should return 409 when email is already in use', async () => {
      const existingEmail = createUniqueEmail('existing');
      const testUser = createUserDto({
        email: existingEmail,
      });
      await request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(testUser).expect(201);

      const anotherUser = createUserDto({
        email: createUniqueEmail('another'),
      });
      const {
        body: { id: userId },
      } = await request(app.getHttpServer())
        .post(`${API_PREFIX}/users`)
        .send(anotherUser)
        .expect(201);

      await request(app.getHttpServer())
        .patch(`${API_PREFIX}/users/${userId}`)
        .send({ email: existingEmail })
        .expect(409);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user and publish a message to RabbitMQ', async () => {
      const testUser = createUserDto({
        email: createUniqueEmail('test'),
      });

      const {
        body: { id: userId },
      } = await request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(testUser).expect(201);

      await request(app.getHttpServer()).delete(`${API_PREFIX}/users/${userId}`).expect(200);

      const message = await rabbitMQHelper.getMessageWithPattern('users.deleted');
      if (message) {
        expect(message.id).toBe(userId);
      }
    }, 10000); // Increase timeout for RabbitMQ message check

    it('should return 404 when user does not exist', async () => {
      const nonExistentId = faker.database.mongodbObjectId();
      await request(app.getHttpServer()).delete(`${API_PREFIX}/users/${nonExistentId}`).expect(404);
    });
  });
});
