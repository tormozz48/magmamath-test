import * as dotenv from 'dotenv';
import * as path from 'path';

import { createApplication } from './app';
import { setupConnectionUris } from './config/environment';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Setup MongoDB and RabbitMQ connection URIs
setupConnectionUris();

async function bootstrap() {
  const app = await createApplication();

  const port = process.env.USER_SERVICE_PORT || 4000;
  await app.listen(port, () => {
    console.log(`User service is running on port ${port} with prefix api/v1`);
    console.log(`Swagger documentation is available at http://localhost:${port}/api/docs`);
  });
}

bootstrap();
