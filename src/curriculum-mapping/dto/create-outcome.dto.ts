import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { OutcomeLevel } from '../entities/learning-outcome.entity';

export class CreateOutcomeDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsEnum(OutcomeLevel)
  level: OutcomeLevel;

  @IsNotEmpty()
  @IsUUID()
  programId: string;
}
