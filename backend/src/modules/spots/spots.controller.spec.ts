import { Test, TestingModule } from '@nestjs/testing';
import { SpotsController } from './spots.controller';
import { SpotsService } from './spots.service';
import { UsersService } from '../users/users.service';
import { NotificationService } from '../notifications/notification.service';
import { UserRole } from '../../common/enums/roles.enum';
import { SpotCategory, NoiseLevel, WifiSpeed, OutletDensity, SeatingComfort, PriceLevel } from '../../common/enums/spot.enum';

describe('SpotsController', () => {
  let controller: SpotsController;
  let spotsService: Partial<SpotsService>;
  let usersService: Partial<UsersService>;
  let notificationService: Partial<NotificationService>;

  const mockSpot: any = {
    _id: 'spot_1',
    name: 'The Rose Main Reading Room',
    slug: 'the-rose-main-reading-room',
    category: SpotCategory.LIBRARY,
    address: '476 5th Ave',
    city: 'New York',
    noiseLevel: NoiseLevel.SILENT,
    wifiSpeed: WifiSpeed.FAST,
    wifiSpeedMbps: 120,
    outletDensity: OutletDensity.ABUNDANT,
    seatingComfort: SeatingComfort.ERGONOMIC,
    priceLevel: PriceLevel.FREE,
    rating: 4.9,
    reviewCount: 48,
    checkInCount: 1420,
    savedCount: 389,
    amenities: ['silent_zone'],
    photos: ['https://example.com/photo.jpg'],
    tags: ['historic'],
    aiSummary: 'Top silent spot',
    bestFor: 'Thesis',
  };

  const mockUser = {
    userId: 'usr_1',
    email: 'scholar@studyspot.ai',
    name: 'Alex Scholar',
    role: UserRole.USER,
  };

  beforeEach(async () => {
    spotsService = {
      findAll: jest.fn().mockResolvedValue({
        items: [mockSpot],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasMore: false,
      }),
      getFeatured: jest.fn().mockResolvedValue([mockSpot]),
      getCategoriesSummary: jest.fn().mockResolvedValue([{ _id: SpotCategory.LIBRARY, count: 5 }]),
      findBySlug: jest.fn().mockResolvedValue(mockSpot),
      findById: jest.fn().mockResolvedValue(mockSpot),
      recordCheckIn: jest.fn().mockResolvedValue({ checkInCount: 1421 }),
      updateSavedCount: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockResolvedValue(mockSpot),
    };

    usersService = {
      recordCheckIn: jest.fn().mockResolvedValue({} as any),
      toggleSaveSpot: jest.fn().mockResolvedValue({ isSaved: true, savedSpotIds: ['spot_1'] }),
    };

    notificationService = {
      sendCheckInNotification: jest.fn().mockResolvedValue({ success: true }),
      sendSpotSavedNotification: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpotsController],
      providers: [
        { provide: SpotsService, useValue: spotsService },
        { provide: UsersService, useValue: usersService },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    controller = module.get<SpotsController>(SpotsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Anonymous / Optional Auth Endpoints', () => {
    it('should allow anonymous users to search spots (user = undefined/null)', async () => {
      const result = await controller.getSpots({ query: 'library' }, undefined);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('The Rose Main Reading Room');
      expect(spotsService.findAll).toHaveBeenCalledWith({ query: 'library' });
    });

    it('should allow anonymous users to get featured spots', async () => {
      const result = await controller.getFeatured();
      expect(result).toHaveLength(1);
      expect(spotsService.getFeatured).toHaveBeenCalled();
    });

    it('should allow anonymous users to view spot categories', async () => {
      const result = await controller.getCategories();
      expect(result).toHaveLength(1);
      expect(spotsService.getCategoriesSummary).toHaveBeenCalled();
    });

    it('should allow anonymous users to view spot by slug', async () => {
      const result = await controller.getBySlug('the-rose-main-reading-room');
      expect(result.slug).toBe('the-rose-main-reading-room');
      expect(spotsService.findBySlug).toHaveBeenCalledWith('the-rose-main-reading-room');
    });

    it('should allow anonymous users to view spot by ID', async () => {
      const result = await controller.getById('spot_1');
      expect(result._id).toBe('spot_1');
      expect(spotsService.findById).toHaveBeenCalledWith('spot_1');
    });
  });

  describe('Protected Endpoints', () => {
    it('should perform check-in when authenticated user calls endpoint', async () => {
      const result = await controller.checkIn('spot_1', mockUser);
      expect(result.success).toBe(true);
      expect(result.checkInCount).toBe(1421);
      expect(usersService.recordCheckIn).toHaveBeenCalledWith('usr_1', 'spot_1', 'The Rose Main Reading Room');
    });

    it('should toggle bookmark when authenticated user calls save endpoint', async () => {
      const result = await controller.toggleSave('spot_1', mockUser);
      expect(result.success).toBe(true);
      expect(result.isSaved).toBe(true);
      expect(usersService.toggleSaveSpot).toHaveBeenCalledWith('usr_1', 'spot_1');
    });
  });
});
