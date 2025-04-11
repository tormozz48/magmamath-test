import * as request from 'supertest';

import { API_PREFIX, app } from './setup';

describe('HealthController (e2e)', () => {
  describe('GET /ping', () => {
    it('should return health check status with MongoDB and RabbitMQ connections', async () => {
      const response = await request(app.getHttpServer()).get(`${API_PREFIX}/ping`).expect(200);

      // Check overall status
      expect(response.body.status).toBe('ok');

      // Check MongoDB status
      expect(response.body.info.mongodb).toBeDefined();
      expect(response.body.info.mongodb.status).toBe('up');

      // Check RabbitMQ status
      expect(response.body.info.rabbitmq).toBeDefined();
      expect(response.body.info.rabbitmq.status).toBe('up');
    });
  });
});
