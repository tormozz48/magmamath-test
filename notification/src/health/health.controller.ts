import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { HealthCheck, HealthCheckResult, HealthCheckService } from '@nestjs/terminus';

import { lastValueFrom, timeout } from 'rxjs';

@Controller('ping')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    @Inject('HEALTH_RABBITMQ_CLIENT') private readonly rabbitClient: ClientProxy,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
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
