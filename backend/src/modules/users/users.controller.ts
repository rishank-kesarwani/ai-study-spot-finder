import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { UpdateUserDto, UpdateStudyPreferencesDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile and study preferences' })
  async getProfile(@CurrentUser() authUser: AuthUser) {
    const user = await this.usersService.findById(authUser.userId);
    if (!user) {
      throw new NotFoundException('User profile not found');
    }
    return user;
  }

  @Put('me')
  @ApiOperation({ summary: 'Update profile info (name, avatar)' })
  async updateProfile(
    @CurrentUser() authUser: AuthUser,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(authUser.userId, updateDto);
  }

  @Put('me/preferences')
  @ApiOperation({ summary: 'Update study preferences (noise tolerance, wifi, drink, persona)' })
  async updatePreferences(
    @CurrentUser() authUser: AuthUser,
    @Body() prefDto: UpdateStudyPreferencesDto,
  ) {
    return this.usersService.updateStudyPreferences(authUser.userId, prefDto);
  }
}
