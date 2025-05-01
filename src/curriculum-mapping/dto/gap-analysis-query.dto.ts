import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { OutcomeLevel } from '../entities/learning-outcome.entity';

export class GapAnalysisQueryDto {
  @IsOptional()
  @IsEnum(OutcomeLevel)
  outcomeLevel?: OutcomeLevel;

  @IsOptional()
  @IsBoolean()
  includeSuggestions?: boolean = true;
}
