import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Spot, SpotDocument } from '../spots/schemas/spot.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { RedisService } from '../redis/redis.service';
import { PaginatedResult } from '../../common/interfaces/api-response.interface';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(Spot.name)
    private readonly spotModel: Model<SpotDocument>,
    private readonly redisService: RedisService,
  ) {}

  async create(
    spotId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    dto: CreateReviewDto,
  ): Promise<ReviewDocument> {
    const spot = await this.spotModel.findById(spotId);
    if (!spot) {
      throw new NotFoundException(`Study spot with ID ${spotId} not found`);
    }

    const review = new this.reviewModel({
      ...dto,
      spotId,
      userId,
      userName,
      userAvatar,
    });

    const savedReview = await review.save();

    // Recalculate average rating for spot
    await this.updateSpotAggregatedRating(spotId);

    // Invalidate spot caches
    await this.redisService.del(`spot:id:${spotId}`);
    await this.redisService.del(`spot:slug:${spot.slug}`);
    await this.redisService.del(`spot:${spotId}:reviews`);
    await this.redisService.invalidatePrefix('spots:search:');

    return savedReview;
  }

  async findBySpot(
    spotId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<ReviewDocument>> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.reviewModel
        .find({ spotId })
        .sort({ helpfulCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments({ spotId }).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasMore: page * limit < total,
    };
  }

  async toggleHelpful(
    reviewId: string,
    userId: string,
  ): Promise<{ helpfulCount: number; isHelpful: boolean }> {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const index = review.helpfulUserIds.indexOf(userId);
    let isHelpful = false;

    if (index > -1) {
      review.helpfulUserIds.splice(index, 1);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
      isHelpful = false;
    } else {
      review.helpfulUserIds.push(userId);
      review.helpfulCount += 1;
      isHelpful = true;
    }

    await review.save();
    return { helpfulCount: review.helpfulCount, isHelpful };
  }

  private async updateSpotAggregatedRating(spotId: string): Promise<void> {
    const stats = await this.reviewModel.aggregate([
      { $match: { spotId: new this.reviewModel.base.Types.ObjectId(spotId) } },
      {
        $group: {
          _id: '$spotId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      const avg = Number(stats[0].avgRating.toFixed(1));
      const count = stats[0].count;
      await this.spotModel.findByIdAndUpdate(spotId, {
        rating: avg,
        reviewCount: count,
      });
    }
  }
}
