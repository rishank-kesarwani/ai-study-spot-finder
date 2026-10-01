import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SpotsService } from './spots.service';
import { CreateSpotDto, SpotQueryDto } from './dto/spot-query.dto';
import { OptionalAuth } from '../../common/decorators/optional-auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/roles.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UsersService } from '../users/users.service';
import { NotificationService } from '../notifications/notification.service';

@ApiTags('spots')
@Controller('spots')
export class SpotsController {
  constructor(
    private readonly spotsService: SpotsService,
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
  ) {}

  @OptionalAuth()
  @Get()
  @ApiOperation({ summary: 'Search and filter study spots (Optional Auth)' })
  async getSpots(@Query() query: SpotQueryDto, @CurrentUser() user?: AuthUser) {
    return this.spotsService.findAll(query);
  }

  @OptionalAuth()
  @Get('featured')
  @ApiOperation({ summary: 'Get curated featured study spots (Optional Auth)' })
  async getFeatured() {
    return this.spotsService.getFeatured();
  }

  @OptionalAuth()
  @Get('categories')
  @ApiOperation({ summary: 'Get spot category statistics (Optional Auth)' })
  async getCategories() {
    return this.spotsService.getCategoriesSummary();
  }

  @OptionalAuth()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get study spot details by slug (Optional Auth)' })
  async getBySlug(@Param('slug') slug: string) {
    return this.spotsService.findBySlug(slug);
  }

  @OptionalAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get study spot details by ID (Optional Auth)' })
  async getById(@Param('id') id: string) {
    return this.spotsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new study spot (Admin only)' })
  async createSpot(@Body() dto: CreateSpotDto) {
    return this.spotsService.create(dto);
  }

  @Post(':id/check-in')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check in to a study spot' })
  async checkIn(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const spot = await this.spotsService.findById(id);
    const result = await this.spotsService.recordCheckIn(id);
    await this.usersService.recordCheckIn(user.userId, id, spot.name);

    // Notify user
    this.notificationService
      .sendCheckInNotification(
        { userId: user.userId, email: user.email, name: user.name },
        { id: spot._id.toString(), name: spot.name },
      )
      .catch(() => {});

    return {
      success: true,
      message: `Checked in to ${spot.name}!`,
      checkInCount: result.checkInCount,
    };
  }

  @Post(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bookmark / save or unsave a study spot' })
  async toggleSave(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const spot = await this.spotsService.findById(id);
    const result = await this.usersService.toggleSaveSpot(user.userId, id);
    await this.spotsService.updateSavedCount(id, result.isSaved ? 1 : -1);

    if (result.isSaved) {
      this.notificationService
        .sendSpotSavedNotification(
          { userId: user.userId, email: user.email, name: user.name },
          { id: spot._id.toString(), name: spot.name, address: spot.address },
        )
        .catch(() => {});
    }

    return {
      success: true,
      isSaved: result.isSaved,
      savedSpotIds: result.savedSpotIds,
      message: result.isSaved ? 'Saved to study spots' : 'Removed from study spots',
    };
  }
}
