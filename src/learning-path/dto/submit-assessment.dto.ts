import { ApiProperty } from '@nestjs/swagger';

export class SubmitAssessmentDto {
  @ApiProperty()
  learnerId: string;

  @ApiProperty()
  score: number;
}
