import { NestFactory } from '@nestjs/core';

import * as dotenv from 'dotenv';
import * as path from 'path';

import { AppModule } from './app.module';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.NOTIFICATION_SERVICE_PORT || 4001;
  await app.listen(port);
  console.log(`Notification service is running on port ${port}`);
}
bootstrap();
