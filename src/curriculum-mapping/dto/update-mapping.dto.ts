import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CoverageLevel } from '../entities/mapping.entity';

export class UpdateMappingDto {
  @IsOptional()
  @IsEnum(CoverageLevel)
  coverageLevel?: CoverageLevel;

  @IsOptional()
  @IsString()
  notes?: string;
}