import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsNumber } from 'class-validator';

export class CreateResponseDto {
  @ApiProperty({ 
    description: 'Response data as a JSON object mapping question IDs to answers',
    example: {
      'question-uuid-1': 'Text answer',
      'question-uuid-2': 4,
      'question-uuid-3': ['option-uuid-1', 'option-uuid-3']
    }
  })
  @IsObject()
  data: Record<string, any>;

  @ApiProperty({ 
    description: 'Time taken to complete the survey in seconds',
    required: false,
    example: 120 
  })
  @IsNumber()
  @IsOptional()
  completionTime?: number;
}
