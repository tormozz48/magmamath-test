import { Logger } from '@nestjs/common';

import * as dotenv from 'dotenv';
import * as path from 'path';

import { createApplication } from './app';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function bootstrap() {
  const logger = new Logger('main');
  const app = await createApplication();

  const port = process.env.USER_SERVICE_PORT || 4000;
  await app.listen(port, () => {
    logger.log(`User service is running on port ${port} with prefix api/v1`);
    logger.log(`Swagger documentation is available at http://localhost:${port}/api/docs`);
  });
}

bootstrap();
