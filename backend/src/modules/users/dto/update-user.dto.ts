import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { NoiseLevel, SpotCategory } from '../../../common/enums/spot.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UpdateStudyPreferencesDto {
  @IsOptional()
  @IsArray()
  @IsEnum(NoiseLevel, { each: true })
  preferredNoiseLevels?: NoiseLevel[];

  @IsOptional()
  @IsArray()
  @IsEnum(SpotCategory, { each: true })
  preferredCategories?: SpotCategory[];

  @IsOptional()
  @IsNumber()
  minWifiSpeedMbps?: number;

  @IsOptional()
  @IsBoolean()
  requiresOutlets?: boolean;

  @IsOptional()
  @IsString()
  favoriteDrink?: string;

  @IsOptional()
  @IsString()
  studyPersona?: string;
}
