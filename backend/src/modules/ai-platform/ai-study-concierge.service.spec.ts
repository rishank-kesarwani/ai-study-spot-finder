import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiStudyConciergeService } from './ai-study-concierge.service';
import { AiPlatformClient } from './ai-platform.client';
import { AiCostTrackerService } from './ai-cost-tracker.service';
import { SpotsService } from '../spots/spots.service';
import { UsersService } from '../users/users.service';

describe('AiStudyConciergeService', () => {
  let service: AiStudyConciergeService;
  let aiClient: Partial<AiPlatformClient>;
  let costTracker: Partial<AiCostTrackerService>;
  let spotsService: Partial<SpotsService>;
  let usersService: Partial<UsersService>;

  beforeEach(async () => {
    aiClient = {
      chat: jest.fn().mockResolvedValue({
        reply: 'I recommend The Rose Main Reading Room for deep academic focus.',
        suggestedSpots: [
          {
            name: 'The Rose Main Reading Room',
            category: 'library',
            matchReason: 'Ultra quiet with great light.',
            matchScore: 98,
            bestFeatures: ['Silent', 'Fast WiFi'],
            recommendedStudyType: 'Thesis Writing',
          },
        ],
        usage: { promptTokens: 100, completionTokens: 150, totalTokens: 250 },
        model: 'gemini-1.5-pro',
      }),
    };

    costTracker = {
      trackUsage: jest.fn().mockReturnValue({
        timestamp: new Date().toISOString(),
        totalTokens: 250,
        estimatedCostUsd: 0.0001,
      }),
      getSummary: jest.fn().mockReturnValue({ totalRequests: 1, totalTokensUsed: 250 }),
    };

    spotsService = {
      findAll: jest.fn().mockResolvedValue({
        items: [
          {
            _id: 'spot_1',
            name: 'The Rose Main Reading Room',
            category: 'library',
            city: 'New York',
            noiseLevel: 'silent',
            wifiSpeed: 'fast',
            wifiSpeedMbps: 120,
            outletDensity: 'abundant',
            rating: 4.9,
            reviewCount: 48,
            bestFor: 'Thesis',
            aiSummary: 'Top silent spot',
          },
        ],
        total: 1,
      }),
      findById: jest.fn().mockResolvedValue({
        _id: 'spot_1',
        name: 'The Rose Main Reading Room',
      }),
    };

    usersService = {
      findById: jest.fn().mockResolvedValue({
        name: 'Alex',
        studyPreferences: { studyPersona: 'Deep Scholar' },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiStudyConciergeService,
        { provide: AiPlatformClient, useValue: aiClient },
        { provide: AiCostTrackerService, useValue: costTracker },
        { provide: SpotsService, useValue: spotsService },
        { provide: UsersService, useValue: usersService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: any) => defaultValue),
          },
        },
      ],
    }).compile();

    service = module.get<AiStudyConciergeService>(AiStudyConciergeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should chat and enrich spot recommendations', async () => {
    const result = await service.chat('usr_123', {
      messages: [{ role: 'user', content: 'Find me a silent library for writing' }],
    });

    expect(result).toHaveProperty('reply');
    expect(result.suggestedSpots).toHaveLength(1);
    expect(result.enrichedSpots).toHaveLength(1);
    expect(result.enrichedSpots[0].spot).toBeDefined();
  });
});
