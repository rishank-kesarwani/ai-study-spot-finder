import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SavedSpotsService } from './saved-spots.service';
import { CreateStudyListDto, UpdateStudyListDto } from './dto/study-list.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';

@ApiTags('saved-spots')
@Controller('saved-spots')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SavedSpotsController {
  constructor(private readonly savedSpotsService: SavedSpotsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all saved spots for current user' })
  async getSavedSpots(@CurrentUser() user: AuthUser) {
    return this.savedSpotsService.getUserSavedSpots(user.userId);
  }

  @Get('lists')
  @ApiOperation({ summary: 'Get all study lists created by current user' })
  async getLists(@CurrentUser() user: AuthUser) {
    return this.savedSpotsService.getUserLists(user.userId);
  }

  @Post('lists')
  @ApiOperation({ summary: 'Create a new custom study list' })
  async createList(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateStudyListDto,
  ) {
    return this.savedSpotsService.createList(user.userId, dto);
  }

  @Get('lists/:id')
  @ApiOperation({ summary: 'Get study list details with populated spots' })
  async getListById(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.savedSpotsService.getListById(id, user.userId);
  }

  @Put('lists/:id')
  @ApiOperation({ summary: 'Update study list title, description, or icon' })
  async updateList(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateStudyListDto,
  ) {
    return this.savedSpotsService.updateList(id, user.userId, dto);
  }

  @Delete('lists/:id')
  @ApiOperation({ summary: 'Delete a study list' })
  async deleteList(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.savedSpotsService.deleteList(id, user.userId);
  }

  @Post('lists/:id/toggle/:spotId')
  @ApiOperation({ summary: 'Add or remove a spot from a custom study list' })
  async toggleSpotInList(
    @Param('id') id: string,
    @Param('spotId') spotId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.savedSpotsService.toggleSpotInList(id, user.userId, spotId);
  }
}
