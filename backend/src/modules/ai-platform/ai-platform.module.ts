import { Module } from '@nestjs/common';
import { AiPlatformClient } from './ai-platform.client';
import { AiCostTrackerService } from './ai-cost-tracker.service';
import { AiStudyConciergeService } from './ai-study-concierge.service';
import { AiStudyConciergeController } from './ai-study-concierge.controller';
import { SpotsModule } from '../spots/spots.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [SpotsModule, UsersModule],
  controllers: [AiStudyConciergeController],
  providers: [
    AiPlatformClient,
    AiCostTrackerService,
    AiStudyConciergeService,
  ],
  exports: [
    AiPlatformClient,
    AiCostTrackerService,
    AiStudyConciergeService,
  ],
})
export class AiPlatformModule {}
