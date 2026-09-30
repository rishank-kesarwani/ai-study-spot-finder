import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AiStudyConciergeService,
  ConciergeChatDto,
} from './ai-study-concierge.service';
import { AiPlatformClient } from './ai-platform.client';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/roles.enum';

@ApiTags('ai-concierge')
@Controller('ai')
export class AiStudyConciergeController {
  constructor(
    private readonly conciergeService: AiStudyConciergeService,
    private readonly aiClient: AiPlatformClient,
  ) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Post('concierge/chat')
  @ApiOperation({ summary: 'Chat with AI Study Spot Concierge (optional auth for personalization)' })
  async chat(
    @CurrentUser() user: AuthUser | null,
    @Body() dto: ConciergeChatDto,
  ) {
    return this.conciergeService.chat(user?.userId, dto);
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Check AI Platform connection status' })
  async checkHealth() {
    const isHealthy = await this.aiClient.checkHealth();
    return {
      connected: isHealthy,
      service: 'ai-platform',
    };
  }

  @Get('telemetry')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI token and cost telemetry (Admin only)' })
  async getTelemetry() {
    return this.conciergeService.getCostTelemetry();
  }
}
