import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { NoiseLevel, OutletDensity, WifiSpeed } from '../../../common/enums/spot.enum';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Spot', required: true, index: true })
  spotId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string;

  @Prop({ required: true, trim: true })
  userName: string;

  @Prop({ type: String, default: '' })
  userAvatar: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, enum: NoiseLevel, default: NoiseLevel.QUIET })
  noiseReported: NoiseLevel;

  @Prop({ required: true, enum: WifiSpeed, default: WifiSpeed.FAST })
  wifiReported: WifiSpeed;

  @Prop({ required: true, enum: OutletDensity, default: OutletDensity.ABUNDANT })
  outletsReported: OutletDensity;

  @Prop({ required: true, trim: true, minlength: 10 })
  content: string;

  @Prop({ type: String, default: '' })
  proTip: string;

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop({ type: Number, default: 0 })
  helpfulCount: number;

  @Prop({ type: [String], default: [] })
  helpfulUserIds: string[];
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ spotId: 1, createdAt: -1 });
