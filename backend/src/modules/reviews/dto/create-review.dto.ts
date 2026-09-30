import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import {
  NoiseLevel,
  OutletDensity,
  WifiSpeed,
} from '../../../common/enums/spot.enum';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  @IsEnum(NoiseLevel)
  noiseReported: NoiseLevel;

  @IsNotEmpty()
  @IsEnum(WifiSpeed)
  wifiReported: WifiSpeed;

  @IsNotEmpty()
  @IsEnum(OutletDensity)
  outletsReported: OutletDensity;

  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: 'Review content must be at least 10 characters' })
  content: string;

  @IsOptional()
  @IsString()
  proTip?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}
