import { Connection, connect } from 'mongoose';

export class MongoDBHelper {
  private mongoUri: string;
  private mongoConnection: Connection;

  constructor() {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    this.mongoUri = process.env.MONGODB_URI;
  }

  async connect() {
    this.mongoConnection = (await connect(this.mongoUri)).connection;
  }

  async close() {
    if (this.mongoConnection) {
      await this.mongoConnection.close();
    }
  }

  async purgeDatabase() {
    if (this.mongoConnection && this.mongoConnection.collections) {
      await Promise.all(
        Object.values(this.mongoConnection.collections).map((collection) =>
          collection.deleteMany({}),
        ),
      );
    }
  }
}
