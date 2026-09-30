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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get('spot/:spotId')
  @ApiOperation({ summary: 'Get paginated reviews for a study spot' })
  async getSpotReviews(
    @Param('spotId') spotId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reviewsService.findBySpot(spotId, Number(page), Number(limit));
  }

  @Post('spot/:spotId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a new review for a study spot' })
  async createReview(
    @Param('spotId') spotId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(
      spotId,
      user.userId,
      user.name,
      '',
      dto,
    );
  }

  @Post(':id/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upvote or downvote review helpfulness' })
  async toggleHelpful(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reviewsService.toggleHelpful(id, user.userId);
  }
}
