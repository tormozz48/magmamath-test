import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import * as dotenv from 'dotenv';
import * as path from 'path';

import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@localhost:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}?authSource=admin`,
    ),
    HealthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
