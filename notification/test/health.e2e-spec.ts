import * as request from 'supertest';

import { app } from './setup';

describe('HealthController (e2e)', () => {
  describe('GET /ping', () => {
    it.skip('should return health check status with RabbitMQ connection', async () => {
      const response = await request(app.getHttpServer()).get('/ping').expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.info.rabbitmq).toBeDefined();
      expect(response.body.info.rabbitmq.status).toBe('up');
    });
  });
});
