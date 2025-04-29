import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsObject
} from 'class-validator';

export class CreateSurveyTemplateDto {
  @ApiProperty({ 
    description: 'Template name', 
    example: 'Course Evaluation Standard Template' 
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'Template description', 
    required: false,
    example: 'Standard template for course evaluations with instructor and content questions' 
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Template structure as JSON',
    example: {
      title: 'Course Evaluation',
      description: 'Please provide your feedback on the course',
      isAnonymous: true,
      questions: [
        {
          text: 'How would you rate the course content?',
          type: 'RATING',
          isRequired: true,
          minValue: 1,
          maxValue: 5
        }
      ]
    }
  })
  @IsObject()
  structure: Record<string, any>;

  @ApiProperty({ 
    description: 'Template category',
    required: false,
    example: 'Course Evaluation' 
  })
  @IsString()
  @IsOptional()
  category?: string;
}