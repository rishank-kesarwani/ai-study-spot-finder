import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateStudyPreferencesDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto, passwordHash: string): Promise<UserDocument> {
    const existing = await this.userModel.findOne({
      email: createUserDto.email.toLowerCase(),
    });
    if (existing) {
      throw new ConflictException('A user with this email address already exists');
    }

    const newUser = new this.userModel({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
      passwordHash,
    });

    return newUser.save();
  }

  async findByEmail(email: string, includeSecrets = false): Promise<UserDocument | null> {
    const query = this.userModel.findOne({ email: email.toLowerCase() });
    if (includeSecrets) {
      query.select('+passwordHash +hashedRefreshToken +passwordResetToken +passwordResetExpires');
    }
    return query.exec();
  }

  async findById(id: string, includeSecrets = false): Promise<UserDocument | null> {
    const query = this.userModel.findById(id);
    if (includeSecrets) {
      query.select('+passwordHash +hashedRefreshToken +passwordResetToken +passwordResetExpires');
    }
    return query.exec();
  }

  async updateProfile(id: string, updateDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: updateDto }, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateStudyPreferences(
    id: string,
    prefDto: UpdateStudyPreferencesDto,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.studyPreferences = {
      ...user.studyPreferences,
      ...prefDto,
    };

    return user.save();
  }

  async updateRefreshToken(id: string, hashedRefreshToken: string | null): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      $set: { hashedRefreshToken },
    });
  }

  async setPasswordResetToken(
    id: string,
    hashedToken: string,
    expires: Date,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      $set: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expires,
      },
    });
  }

  async clearPasswordResetToken(id: string, newPasswordHash: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      $set: {
        passwordHash: newPasswordHash,
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
      },
    });
  }

  async toggleSaveSpot(userId: string, spotId: string): Promise<{ isSaved: boolean; savedSpotIds: string[] }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const index = user.savedSpotIds.indexOf(spotId);
    let isSaved = false;

    if (index > -1) {
      user.savedSpotIds.splice(index, 1);
      isSaved = false;
    } else {
      user.savedSpotIds.push(spotId);
      isSaved = true;
    }

    await user.save();
    return { isSaved, savedSpotIds: user.savedSpotIds };
  }

  async recordCheckIn(userId: string, spotId: string, spotName: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    user.checkIns.unshift({
      spotId,
      spotName,
      visitedAt: new Date(),
    });

    if (user.checkIns.length > 50) {
      user.checkIns.pop();
    }

    return user.save();
  }
}
