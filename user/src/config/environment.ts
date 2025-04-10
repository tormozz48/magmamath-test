/**
 * Sets up environment variables for MongoDB and RabbitMQ connections
 * based on individual configuration variables
 */
export function setupConnectionUris(): void {
  // MongoDB Configuration
  const mongoHost = process.env.MONGODB_HOST || 'localhost';
  const mongoPort = process.env.MONGODB_PORT || '27017';
  const mongoUser = process.env.MONGODB_USER;
  const mongoPassword = process.env.MONGODB_PASSWORD;
  const mongoDatabase = process.env.MONGODB_DATABASE || 'users_db';

  // Build MongoDB URI
  let mongoUri = 'mongodb://';

  // Add authentication if username and password are provided
  if (mongoUser && mongoPassword) {
    mongoUri += `${mongoUser}:${mongoPassword}@`;
  }

  // Add host, port, and database
  mongoUri += `${mongoHost}:${mongoPort}/${mongoDatabase}`;

  // Add authentication source if username and password are provided
  if (mongoUser && mongoPassword) {
    mongoUri += '?authSource=admin';
  }

  // Set MongoDB URI environment variable
  process.env.MONGODB_URI = mongoUri;

  // RabbitMQ Configuration
  const rabbitHost = process.env.RABBITMQ_HOST || 'localhost';
  const rabbitPort = process.env.RABBITMQ_PORT || '5672';
  const rabbitUser = process.env.RABBITMQ_USER || 'guest';
  const rabbitPassword = process.env.RABBITMQ_PASSWORD || 'guest';

  // Build RabbitMQ URI
  const rabbitUri = `amqp://${rabbitUser}:${rabbitPassword}@${rabbitHost}:${rabbitPort}`;

  // Set RabbitMQ URI environment variable
  process.env.RABBITMQ_URI = rabbitUri;

  console.log('Environment connection URIs configured:');
  console.log(`- MongoDB URI: ${maskPassword(process.env.MONGODB_URI)}`);
  console.log(`- RabbitMQ URI: ${maskPassword(process.env.RABBITMQ_URI)}`);
}

/**
 * Masks password in a connection URI for logging purposes
 * @param uri Connection URI
 * @returns URI with password masked
 */
function maskPassword(uri: string | undefined): string {
  if (!uri) return 'undefined';

  // For URIs with authentication
  if (uri.includes('@')) {
    const parts = uri.split('@');
    const authPart = parts[0];
    const restPart = parts.slice(1).join('@');

    if (authPart.includes(':')) {
      const authParts = authPart.split(':');
      const protocol = authParts[0];
      const username = authParts[1];

      return `${protocol}:${username}:****@${restPart}`;
    }
  }

  return uri;
}
