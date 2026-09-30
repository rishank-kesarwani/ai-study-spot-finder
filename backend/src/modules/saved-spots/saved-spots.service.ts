import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudyList, StudyListDocument } from './schemas/study-list.schema';
import { Spot, SpotDocument } from '../spots/schemas/spot.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateStudyListDto, UpdateStudyListDto } from './dto/study-list.dto';

@Injectable()
export class SavedSpotsService {
  private readonly logger = new Logger(SavedSpotsService.name);

  constructor(
    @InjectModel(StudyList.name)
    private readonly listModel: Model<StudyListDocument>,
    @InjectModel(Spot.name)
    private readonly spotModel: Model<SpotDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getUserSavedSpots(userId: string): Promise<SpotDocument[]> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.savedSpotIds || user.savedSpotIds.length === 0) {
      return [];
    }
    return this.spotModel.find({ _id: { $in: user.savedSpotIds } }).exec();
  }

  async getUserLists(userId: string): Promise<StudyListDocument[]> {
    return this.listModel
      .find({ userId })
      .populate('spotIds')
      .sort({ createdAt: -1 })
      .exec();
  }

  async createList(
    userId: string,
    dto: CreateStudyListDto,
  ): Promise<StudyListDocument> {
    const list = new this.listModel({
      ...dto,
      userId,
      spotIds: [],
    });
    return list.save();
  }

  async getListById(listId: string, userId?: string): Promise<StudyListDocument> {
    const list = await this.listModel.findById(listId).populate('spotIds').exec();
    if (!list) {
      throw new NotFoundException('Study list not found');
    }
    return list;
  }

  async updateList(
    listId: string,
    userId: string,
    dto: UpdateStudyListDto,
  ): Promise<StudyListDocument> {
    const list = await this.listModel.findOneAndUpdate(
      { _id: listId, userId },
      { $set: dto },
      { new: true },
    );
    if (!list) {
      throw new NotFoundException('Study list not found or unauthorized');
    }
    return list;
  }

  async deleteList(listId: string, userId: string): Promise<{ success: boolean }> {
    const res = await this.listModel.deleteOne({ _id: listId, userId });
    if (res.deletedCount === 0) {
      throw new NotFoundException('Study list not found or unauthorized');
    }
    return { success: true };
  }

  async toggleSpotInList(
    listId: string,
    userId: string,
    spotId: string,
  ): Promise<StudyListDocument> {
    const list = await this.listModel.findOne({ _id: listId, userId });
    if (!list) {
      throw new NotFoundException('Study list not found');
    }

    const index = list.spotIds.indexOf(spotId);
    if (index > -1) {
      list.spotIds.splice(index, 1);
    } else {
      list.spotIds.push(spotId);
    }

    await list.save();
    return this.listModel.findById(listId).populate('spotIds').exec();
  }
}
