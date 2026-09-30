import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SpotsService } from './spots.service';
import { Spot } from './schemas/spot.schema';
import { RedisService } from '../redis/redis.service';
import { NoiseLevel, SpotCategory, WifiSpeed, OutletDensity } from '../../common/enums/spot.enum';

describe('SpotsService', () => {
  let service: SpotsService;
  let redisService: Partial<RedisService>;

  const mockSpot = {
    _id: 'spot_123',
    name: 'The Rose Main Reading Room',
    slug: 'the-rose-main-reading-room',
    category: SpotCategory.LIBRARY,
    address: '476 5th Ave',
    city: 'New York',
    noiseLevel: NoiseLevel.SILENT,
    wifiSpeed: WifiSpeed.FAST,
    outletDensity: OutletDensity.ABUNDANT,
    rating: 4.9,
    reviewCount: 48,
    checkInCount: 1420,
  };

  const mockSpotModel: any = {
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockSpot]),
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockSpot),
    }),
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockSpot),
    }),
    countDocuments: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    }),
    findByIdAndUpdate: jest.fn().mockResolvedValue({
      ...mockSpot,
      checkInCount: 1421,
    }),
  };

  beforeEach(async () => {
    redisService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
      invalidatePrefix: jest.fn().mockResolvedValue(undefined),
      getOrSet: jest.fn((key, fn) => fn()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotsService,
        { provide: getModelToken(Spot.name), useValue: mockSpotModel },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    service = module.get<SpotsService>(SpotsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find spots with pagination', async () => {
    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.items[0].name).toBe('The Rose Main Reading Room');
  });

  it('should get spot by ID', async () => {
    const result = await service.findById('spot_123');
    expect(result).toBeDefined();
    expect(result.name).toBe('The Rose Main Reading Room');
  });
});
