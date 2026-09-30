import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { AiPlatformModule } from '../ai-platform/ai-platform.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TerminusModule, AiPlatformModule, NotificationsModule],
  controllers: [HealthController],
})
export class HealthModule {}
