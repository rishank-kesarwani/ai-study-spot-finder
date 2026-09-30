import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  NoiseLevel,
  OutletDensity,
  PriceLevel,
  SpotCategory,
  WifiSpeed,
} from '../../../common/enums/spot.enum';

export class SpotQueryDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsEnum(SpotCategory)
  category?: SpotCategory;

  @IsOptional()
  @IsEnum(NoiseLevel)
  noiseLevel?: NoiseLevel;

  @IsOptional()
  @IsEnum(WifiSpeed)
  wifiSpeed?: WifiSpeed;

  @IsOptional()
  @IsEnum(OutletDensity)
  outletDensity?: OutletDensity;

  @IsOptional()
  @IsEnum(PriceLevel)
  priceLevel?: PriceLevel;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radiusKm?: number; // Distance in KM

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  openNow?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: 'rating' | 'popularity' | 'distance' | 'newest' = 'popularity';
}

export class CreateSpotDto {
  @IsString()
  name: string;

  @IsEnum(SpotCategory)
  category: SpotCategory;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsEnum(NoiseLevel)
  noiseLevel: NoiseLevel;

  @IsEnum(WifiSpeed)
  wifiSpeed: WifiSpeed;

  @IsOptional()
  @IsNumber()
  wifiSpeedMbps?: number;

  @IsEnum(OutletDensity)
  outletDensity: OutletDensity;

  @IsOptional()
  @IsEnum(PriceLevel)
  priceLevel?: PriceLevel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  aiSummary?: string;

  @IsOptional()
  @IsString()
  bestFor?: string;

  @IsOptional()
  @IsString()
  insiderTip?: string;
}
