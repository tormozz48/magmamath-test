import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

import { Connection } from 'mongoose';
import { lastValueFrom, timeout } from 'rxjs';

@ApiTags('health')
@Controller('ping')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongooseHealth: MongooseHealthIndicator,
    @InjectConnection() private readonly connection: Connection,
    @Inject('HEALTH_RABBITMQ_CLIENT') private readonly rabbitClient: ClientProxy,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check service health status' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
        },
        info: {
          type: 'object',
          properties: {
            mongodb: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
            rabbitmq: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
          },
        },
        error: {
          type: 'object',
          example: {},
        },
        details: {
          type: 'object',
        },
      },
    },
  })
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      async () =>
        this.mongooseHealth.pingCheck('mongodb', {
          connection: this.connection,
          timeout: 5000,
        }),

      async () => {
        try {
          await lastValueFrom(this.rabbitClient.emit('ping', {}).pipe(timeout(5000)));

          return {
            rabbitmq: {
              status: 'up',
            },
          };
        } catch {
          return {
            rabbitmq: {
              status: 'down',
            },
          };
        }
      },
    ]);
  }
}
