import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Spot, SpotDocument } from './schemas/spot.schema';
import { SpotQueryDto, CreateSpotDto } from './dto/spot-query.dto';
import { RedisService } from '../redis/redis.service';
import { PaginatedResult } from '../../common/interfaces/api-response.interface';
import { DEFAULT_STUDY_SPOTS } from './data/default-spots.data';

@Injectable()
export class SpotsService implements OnModuleInit {
  private readonly logger = new Logger(SpotsService.name);

  constructor(
    @InjectModel(Spot.name) private readonly spotModel: Model<SpotDocument>,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    try {
      this.logger.log('Syncing global curated study spot catalog...');
      for (const spot of DEFAULT_STUDY_SPOTS) {
        await this.spotModel.updateOne(
          { slug: spot.slug },
          { $set: spot },
          { upsert: true },
        );
      }
      await this.redisService.invalidatePrefix('spots:');
      const count = await this.spotModel.countDocuments().exec();
      this.logger.log(`Global study spot catalog ready (${count} spots indexed across India, Japan, Thailand, Singapore, UK, USA).`);
    } catch (err: any) {
      this.logger.warn(`Global spot sync encountered non-fatal notice: ${err.message}`);
    }
  }

  async findAll(queryDto: SpotQueryDto): Promise<PaginatedResult<SpotDocument>> {
    const {
      query,
      country,
      city,
      category,
      noiseLevel,
      wifiSpeed,
      outletDensity,
      priceLevel,
      minRating,
      lat,
      lng,
      radiusKm,
      page = 1,
      limit = 20,
      sortBy = 'popularity',
    } = queryDto;

    const cacheKey = `spots:search:${JSON.stringify(queryDto)}`;
    const cached = await this.redisService.get<PaginatedResult<SpotDocument>>(cacheKey);
    if (cached) {
      return cached;
    }

    const filter: FilterQuery<SpotDocument> = {};

    if (category) filter.category = category;
    if (noiseLevel) filter.noiseLevel = noiseLevel;
    if (wifiSpeed) filter.wifiSpeed = wifiSpeed;
    if (outletDensity) filter.outletDensity = outletDensity;
    if (priceLevel) filter.priceLevel = priceLevel;
    if (minRating) filter.rating = { $gte: minRating };

    if (country && country.trim().length > 0) {
      const cleanCountry = country.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { country: new RegExp(cleanCountry, 'i') },
        { countryCode: new RegExp(cleanCountry, 'i') },
      ];
    }

    if (city && city.trim().length > 0) {
      const cleanCity = city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.city = new RegExp(cleanCity, 'i');
    }

    if (query && query.trim().length > 0) {
      const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedQuery, 'i');
      const searchConditions = [
        { name: searchRegex },
        { address: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
        { country: searchRegex },
        { tags: searchRegex },
        { aiSummary: searchRegex },
        { bestFor: searchRegex },
      ];

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    // Geospatial search if coordinates provided
    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
      const maxDistanceMeters = (radiusKm || 15) * 1000;
      filter.location = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistanceMeters,
        },
      };
    }

    const skip = (page - 1) * limit;

    let sortOption: any = { rating: -1, checkInCount: -1 };
    if (sortBy === 'newest') sortOption = { createdAt: -1 };
    if (sortBy === 'popularity') sortOption = { checkInCount: -1, rating: -1 };
    if (sortBy === 'rating') sortOption = { rating: -1 };

    // If using geospatial $nearSphere, MongoDB automatically sorts by distance
    const isGeoNear = lat !== undefined && lng !== undefined;

    const [items, total] = await Promise.all([
      isGeoNear
        ? this.spotModel.find(filter).skip(skip).limit(limit).exec()
        : this.spotModel.find(filter).sort(sortOption).skip(skip).limit(limit).exec(),
      this.spotModel.countDocuments(filter).exec(),
    ]);

    const result: PaginatedResult<SpotDocument> = {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasMore: page * limit < total,
    };

    // Cache search results for 5 minutes
    await this.redisService.set(cacheKey, result, 300);

    return result;
  }

  async findById(id: string): Promise<SpotDocument> {
    const cacheKey = `spot:id:${id}`;
    const cached = await this.redisService.get<SpotDocument>(cacheKey);
    if (cached) return cached;

    const spot = await this.spotModel.findById(id).exec();
    if (!spot) {
      throw new NotFoundException(`Study spot with ID ${id} not found`);
    }

    await this.redisService.set(cacheKey, spot, 600);
    return spot;
  }

  async findBySlug(slug: string): Promise<SpotDocument> {
    const cacheKey = `spot:slug:${slug}`;
    const cached = await this.redisService.get<SpotDocument>(cacheKey);
    if (cached) return cached;

    const spot = await this.spotModel.findOne({ slug }).exec();
    if (!spot) {
      throw new NotFoundException(`Study spot "${slug}" not found`);
    }

    await this.redisService.set(cacheKey, spot, 600);
    return spot;
  }

  async create(createDto: CreateSpotDto): Promise<SpotDocument> {
    const slug = createDto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existing = await this.spotModel.findOne({ slug });
    if (existing) {
      throw new BadRequestException('A study spot with this name already exists');
    }

    const newSpot = new this.spotModel({
      ...createDto,
      slug,
      location: {
        type: 'Point',
        coordinates: [createDto.lng, createDto.lat],
      },
    });

    const saved = await newSpot.save();
    await this.redisService.invalidatePrefix('spots:');
    return saved;
  }

  async recordCheckIn(id: string): Promise<{ checkInCount: number }> {
    const spot = await this.spotModel.findByIdAndUpdate(
      id,
      { $inc: { checkInCount: 1 } },
      { new: true },
    );
    if (!spot) throw new NotFoundException('Spot not found');

    await this.redisService.del(`spot:id:${id}`);
    await this.redisService.del(`spot:slug:${spot.slug}`);
    return { checkInCount: spot.checkInCount };
  }

  async updateSavedCount(id: string, increment: number): Promise<void> {
    await this.spotModel.findByIdAndUpdate(id, {
      $inc: { savedCount: increment },
    });
    await this.redisService.del(`spot:id:${id}`);
  }

  async getFeatured(): Promise<SpotDocument[]> {
    const cacheKey = 'spots:featured';
    return this.redisService.getOrSet(
      cacheKey,
      async () => {
        return this.spotModel
          .find({ rating: { $gte: 4.5 } })
          .sort({ checkInCount: -1, rating: -1 })
          .limit(6)
          .exec();
      },
      600,
    );
  }

  async getCategoriesSummary() {
    return this.spotModel.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }
}
