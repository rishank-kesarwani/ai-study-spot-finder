import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  NoiseLevel,
  OutletDensity,
  PriceLevel,
  SeatingComfort,
  SpotCategory,
  WifiSpeed,
} from '../../../common/enums/spot.enum';

export type SpotDocument = Spot & Document;

@Schema({ _id: false })
export class GeoLocation {
  @Prop({ type: String, enum: ['Point'], default: 'Point' })
  type: string;

  @Prop({ type: [Number], required: true }) // [longitude, latitude]
  coordinates: number[];
}

@Schema({ _id: false })
export class DayHours {
  @Prop({ type: String, default: '08:00' })
  open: string;

  @Prop({ type: String, default: '22:00' })
  close: string;

  @Prop({ type: Boolean, default: true })
  isOpen: boolean;
}

@Schema({ _id: false })
export class WeeklyHours {
  @Prop({ type: DayHours, default: () => ({}) })
  monday: DayHours;

  @Prop({ type: DayHours, default: () => ({}) })
  tuesday: DayHours;

  @Prop({ type: DayHours, default: () => ({}) })
  wednesday: DayHours;

  @Prop({ type: DayHours, default: () => ({}) })
  thursday: DayHours;

  @Prop({ type: DayHours, default: () => ({}) })
  friday: DayHours;

  @Prop({ type: DayHours, default: () => ({}) })
  saturday: DayHours;

  @Prop({ type: DayHours, default: () => ({}) })
  sunday: DayHours;
}

@Schema({ timestamps: true })
export class Spot {
  @Prop({ required: true, trim: true, index: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, enum: SpotCategory, index: true })
  category: SpotCategory;

  @Prop({ required: true, trim: true })
  address: string;

  @Prop({ required: true, trim: true, index: true })
  city: string;

  @Prop({ type: GeoLocation, required: true, index: '2dsphere' })
  location: GeoLocation;

  @Prop({ required: true, enum: NoiseLevel, default: NoiseLevel.QUIET, index: true })
  noiseLevel: NoiseLevel;

  @Prop({ required: true, enum: WifiSpeed, default: WifiSpeed.FAST, index: true })
  wifiSpeed: WifiSpeed;

  @Prop({ type: Number, default: 85 })
  wifiSpeedMbps: number;

  @Prop({ required: true, enum: OutletDensity, default: OutletDensity.ABUNDANT, index: true })
  outletDensity: OutletDensity;

  @Prop({ required: true, enum: SeatingComfort, default: SeatingComfort.ERGONOMIC })
  seatingComfort: SeatingComfort;

  @Prop({ required: true, enum: PriceLevel, default: PriceLevel.AFFORDABLE })
  priceLevel: PriceLevel;

  @Prop({ type: WeeklyHours, default: () => ({}) })
  hours: WeeklyHours;

  @Prop({ type: [String], default: [] })
  amenities: string[]; // e.g. ['standing_desks', 'natural_light', 'whiteboards', 'outdoor_patio', 'pet_friendly']

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop({ type: Number, default: 4.8, min: 1, max: 5, index: true })
  rating: number;

  @Prop({ type: Number, default: 0 })
  reviewCount: number;

  @Prop({ type: Number, default: 0 })
  checkInCount: number;

  @Prop({ type: Number, default: 0 })
  savedCount: number;

  @Prop({ type: [String], default: [], index: true })
  tags: string[];

  @Prop({ type: String, default: '' })
  aiSummary: string;

  @Prop({ type: String, default: 'Deep Work & Focus Sprints' })
  bestFor: string;

  @Prop({ type: String, default: '' })
  insiderTip: string;

  @Prop({ type: String, default: '' })
  websiteUrl?: string;

  @Prop({ type: String, default: '' })
  phone?: string;
}

export const SpotSchema = SchemaFactory.createForClass(Spot);
SpotSchema.index({ name: 'text', address: 'text', tags: 'text', aiSummary: 'text', city: 'text' });
