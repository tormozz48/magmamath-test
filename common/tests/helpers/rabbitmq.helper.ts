import { Logger } from '@nestjs/common';

import * as amqplib from 'amqplib';

export class RabbitMQHelper {
  private readonly timeout: number;
  private readonly logger: Logger;

  private connection: any;
  private channel: any;
  private queue: string;

  constructor({ queue, timeout }: { queue: string; timeout?: number }) {
    this.queue = queue;
    this.timeout = timeout ?? 5000;
    this.logger = new Logger(RabbitMQHelper.name);
  }

  async connect(): Promise<void> {
    try {
      const uri = process.env.RABBITMQ_URI;
      if (!uri) {
        throw new Error('RABBITMQ_URI environment variable is not set');
      }

      this.connection = await amqplib.connect(uri);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queue, { durable: true });

      this.logger.log('Connected to RabbitMQ for testing');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('Closed RabbitMQ connection');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection', error);
    }
  }

  async purgeQueue(): Promise<void> {
    try {
      await this.channel.purgeQueue(this.queue);
      this.logger.log(`Purged queue: ${this.queue}`);
    } catch (error) {
      this.logger.error(`Error purging queue: ${this.queue}`, error);
      throw error;
    }
  }

  async getMessageWithPattern(pattern: string, timeout = this.timeout): Promise<any> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        if (consumerTag) {
          this.channel.cancel(consumerTag);
        }
        resolve(null);
      }, timeout);

      let consumerTag: string;

      this.channel
        .consume(
          this.queue,
          (msg: any) => {
            if (msg) {
              this.handleMessage({ msg, pattern, resolve, timer, consumerTag });
            }
          },
          { noAck: false },
        )
        .then(({ consumerTag: tag }) => {
          consumerTag = tag;
        });
    });
  }

  private handleMessage({
    msg,
    pattern,
    resolve,
    timer,
    consumerTag,
  }: {
    msg: any;
    pattern: string;
    resolve: (value: unknown) => void;
    timer: NodeJS.Timeout;
    consumerTag: string;
  }): void {
    try {
      const content = JSON.parse(msg.content.toString());

      if (msg.properties.headers && msg.properties.headers.pattern === pattern) {
        clearTimeout(timer);
        this.channel.cancel(consumerTag);
        this.channel.ack(msg);
        this.logger.log(`Received message with pattern: ${pattern}`);
        resolve(content);
      } else {
        this.channel.nack(msg, false, true);
      }
    } catch (error) {
      this.channel.nack(msg);
      this.logger.error('Error processing message', error);
    }
  }
}
