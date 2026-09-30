import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../../common/enums/roles.enum';
import { NoiseLevel, SpotCategory } from '../../../common/enums/spot.enum';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class StudyPreferences {
  @Prop({ type: [String], enum: NoiseLevel, default: [NoiseLevel.QUIET, NoiseLevel.SILENT] })
  preferredNoiseLevels: NoiseLevel[];

  @Prop({ type: [String], enum: SpotCategory, default: [SpotCategory.LIBRARY, SpotCategory.CAFE] })
  preferredCategories: SpotCategory[];

  @Prop({ type: Number, default: 50 })
  minWifiSpeedMbps: number;

  @Prop({ type: Boolean, default: true })
  requiresOutlets: boolean;

  @Prop({ type: String, default: 'Matcha Latte & Pour-over' })
  favoriteDrink: string;

  @Prop({ type: String, default: 'Deep Work Scholar' })
  studyPersona: string;
}

@Schema({ _id: false })
export class CheckInRecord {
  @Prop({ type: String, required: true })
  spotId: string;

  @Prop({ type: String, required: true })
  spotName: string;

  @Prop({ type: Date, default: Date.now })
  visitedAt: Date;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: String, default: '' })
  avatar: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER, index: true })
  role: UserRole;

  @Prop({ type: String, select: false })
  hashedRefreshToken?: string;

  @Prop({ type: String, select: false })
  passwordResetToken?: string;

  @Prop({ type: Date, select: false })
  passwordResetExpires?: Date;

  @Prop({ type: StudyPreferences, default: () => ({}) })
  studyPreferences: StudyPreferences;

  @Prop({ type: [CheckInRecord], default: [] })
  checkIns: CheckInRecord[];

  @Prop({ type: [String], default: [] })
  savedSpotIds: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
