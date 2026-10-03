import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SavedSpotsService } from './saved-spots.service';
import { StudyList } from './schemas/study-list.schema';
import { Spot } from '../spots/schemas/spot.schema';
import { User } from '../users/schemas/user.schema';

describe('SavedSpotsService', () => {
  let service: SavedSpotsService;

  const mockListModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockSpotModel = {
    find: jest.fn(),
    findById: jest.fn(),
  };

  const mockUserModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedSpotsService,
        {
          provide: getModelToken(StudyList.name),
          useValue: mockListModel,
        },
        {
          provide: getModelToken(Spot.name),
          useValue: mockSpotModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<SavedSpotsService>(SavedSpotsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return saved spots for a user', async () => {
    mockUserModel.findById.mockResolvedValueOnce({
      savedSpotIds: ['spot-1', 'spot-2'],
    });

    const mockSpots = [
      { _id: 'spot-1', name: 'Library A' },
      { _id: 'spot-2', name: 'Cafe B' },
    ];

    mockSpotModel.find.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce(mockSpots),
    });

    const result = await service.getUserSavedSpots('user-123');
    expect(result).toEqual(mockSpots);
    expect(mockUserModel.findById).toHaveBeenCalledWith('user-123');
  });

  it('should return empty array if user has no saved spots', async () => {
    mockUserModel.findById.mockResolvedValueOnce({
      savedSpotIds: [],
    });

    const result = await service.getUserSavedSpots('user-123');
    expect(result).toEqual([]);
  });
});
