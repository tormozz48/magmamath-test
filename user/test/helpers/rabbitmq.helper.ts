import { Logger } from '@nestjs/common';

import * as amqplib from 'amqplib';

import {
  RABBITMQ_QUEUE,
  RABBITMQ_USER_CREATED_PATTERN,
  RABBITMQ_USER_DELETED_PATTERN,
  RABBITMQ_USER_UPDATED_PATTERN,
} from '../../src/constants/rabbitmq.constants';

export class RabbitMQHelper {
  private connection: any;
  private channel: any;
  private readonly logger = new Logger(RabbitMQHelper.name);
  private readonly defaultTimeout = 5000;

  async connect(): Promise<void> {
    try {
      const uri = process.env.RABBITMQ_URI;
      if (!uri) {
        throw new Error('RABBITMQ_URI environment variable is not set');
      }

      this.connection = await amqplib.connect(uri);
      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue(RABBITMQ_QUEUE, { durable: true });

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
      await this.channel.purgeQueue(RABBITMQ_QUEUE);
      this.logger.log(`Purged queue: ${RABBITMQ_QUEUE}`);
    } catch (error) {
      this.logger.error(`Error purging queue: ${RABBITMQ_QUEUE}`, error);
      throw error;
    }
  }

  async getUserCreatedMessage(timeout = this.defaultTimeout): Promise<any> {
    return this.getMessageWithPattern(RABBITMQ_USER_CREATED_PATTERN, timeout);
  }

  async getUserUpdatedMessage(timeout = this.defaultTimeout): Promise<any> {
    return this.getMessageWithPattern(RABBITMQ_USER_UPDATED_PATTERN, timeout);
  }

  async getUserDeletedMessage(timeout = this.defaultTimeout): Promise<any> {
    return this.getMessageWithPattern(RABBITMQ_USER_DELETED_PATTERN, timeout);
  }

  private async getMessageWithPattern(
    pattern: string,
    timeout = this.defaultTimeout,
  ): Promise<any> {
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
          RABBITMQ_QUEUE,
          (msg: any) => {
            if (msg) {
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
          },
          { noAck: false },
        )
        .then(({ consumerTag: tag }) => {
          consumerTag = tag;
        });
    });
  }
}
