import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsEnum, 
  IsOptional, 
  IsInt, 
  Min, 
  Max,
  IsArray,
  IsBoolean,
  ValidateNested,
  ValidateIf
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../enums/question-type.enum';
import { CreateQuestionOptionDto } from './create-question-option.dto';

export class CreateQuestionDto {
  @ApiProperty({ 
    description: 'Question text', 
    example: 'How would you rate the course content?' 
  })
  @IsString()
  text: string;

  @ApiProperty({ 
    description: 'Additional help text', 
    required: false,
    example: 'Consider the quality, relevance and structure of the materials' 
  })
  @IsString()
  @IsOptional()
  helpText?: string;

  @ApiProperty({ 
    enum: QuestionType,
    enumName: 'QuestionType',
    example: QuestionType.RATING
  })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({ 
    description: 'Question display order', 
    example: 1,
    default: 0 
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiProperty({ 
    description: 'Whether this question requires an answer',
    default: false,
    example: true 
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({ 
    description: 'Minimum value for rating/scale questions',
    required: false,
    example: 1 
  })
  @IsInt()
  @ValidateIf(o => [QuestionType.RATING, QuestionType.SCALE].includes(o.type))
  minValue?: number;

  @ApiProperty({ 
    description: 'Maximum value for rating/scale questions',
    required: false,
    example: 5 
  })
  @IsInt()
  @ValidateIf(o => [QuestionType.RATING, QuestionType.SCALE].includes(o.type))
  maxValue?: number;

  @ApiProperty({ 
    description: 'Label for minimum value',
    required: false,
    example: 'Poor' 
  })
  @IsString()
  @IsOptional()
  minLabel?: string;

  @ApiProperty({ 
    description: 'Label for maximum value',
    required: false,
    example: 'Excellent' 
  })
  @IsString()
  @IsOptional()
  maxLabel?: string;

  @ApiProperty({ 
    description: 'Question options for choice questions',
    type: [CreateQuestionOptionDto],
    required: false,
    example: [
      { text: 'Strongly Disagree', order: 1, value: 1 },
      { text: 'Disagree', order: 2, value: 2 },
      { text: 'Neutral', order: 3, value: 3 },
      { text: 'Agree', order: 4, value: 4 },
      { text: 'Strongly Agree', order: 5, value: 5 }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionOptionDto)
  @ValidateIf(o => [QuestionType.SINGLE_CHOICE, QuestionType.MULTIPLE_CHOICE, QuestionType.LIKERT].includes(o.type))
  options?: CreateQuestionOptionDto[];
}
