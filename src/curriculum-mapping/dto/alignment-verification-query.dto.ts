import { IsOptional, IsBoolean } from 'class-validator';

export class AlignmentVerificationQueryDto {
  @IsOptional()
  @IsBoolean()
  includeUnalignedAssessments?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeRecommendations?: boolean = true;
}