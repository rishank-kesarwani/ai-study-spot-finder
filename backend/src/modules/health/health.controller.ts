import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '../../common/decorators/public.decorator';
import { RedisService } from '../redis/redis.service';
import { AiPlatformClient } from '../ai-platform/ai-platform.client';
import { NotificationClientService } from '../notifications/notification-client.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongooseHealth: MongooseHealthIndicator,
    private readonly redisService: RedisService,
    private readonly aiClient: AiPlatformClient,
    private readonly notifClient: NotificationClientService,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'System liveness and readiness probe' })
  async check() {
    return this.health.check([
      () => this.mongooseHealth.pingCheck('mongodb'),
      async () => {
        const isUp = this.redisService.isHealthy();
        return {
          redis: { status: isUp ? 'up' : 'down' },
        };
      },
      async () => {
        const isConnected = await this.aiClient.checkHealth();
        return {
          aiPlatform: { status: isConnected ? 'up' : 'down' },
        };
      },
      async () => {
        const isConnected = await this.notifClient.checkHealth();
        return {
          notificationService: { status: isConnected ? 'up' : 'down' },
        };
      },
    ]);
  }
}
