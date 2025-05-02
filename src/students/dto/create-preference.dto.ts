import { IsEnum, IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PreferenceType } from '../entities/student-preference.entity';

export class CreatePreferenceDto {
  @ApiProperty({ enum: PreferenceType, description: 'Type of preference' })
  @IsEnum(PreferenceType)
  type: PreferenceType;

  @ApiProperty({ description: 'Key for the preference (e.g., subject code, professor name)' })
  @IsString()
  key: string;

  @ApiProperty({ 
    description: 'Weight value (0-1 where 1 is highest preference)', 
    minimum: 0, 
    maximum: 1 
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  weight: number;

  @ApiPropertyOptional({ description: 'Additional data for the preference' })
  @IsOptional()
  additionalData?: Record<string, any>;
}