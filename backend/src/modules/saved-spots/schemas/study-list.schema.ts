import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type StudyListDocument = StudyList & Document;

@Schema({ timestamps: true })
export class StudyList {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, default: '📚' })
  icon: string;

  @Prop({ type: String, default: '#6366f1' })
  color: string;

  @Prop({ type: Boolean, default: false })
  isPublic: boolean;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Spot' }], default: [] })
  spotIds: string[];
}

export const StudyListSchema = SchemaFactory.createForClass(StudyList);
StudyListSchema.index({ userId: 1, createdAt: -1 });
