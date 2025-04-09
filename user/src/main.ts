import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.USER_SERVICE_PORT || 4000;
  await app.listen(port);
  console.log(`User service is running on port ${port}`);
}
bootstrap();
