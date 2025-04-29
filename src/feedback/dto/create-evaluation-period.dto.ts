import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsBoolean, 
  IsDateString,
  IsArray
} from 'class-validator';

export class CreateEvaluationPeriodDto {
  @ApiProperty({ 
    description: 'Period name', 
    example: 'Spring 2025 Evaluation' 
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'Period description', 
    required: false,
    example: 'Feedback collection for Spring 2025 courses' 
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Start date of evaluation period',
    example: '2025-01-15T00:00:00Z' 
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({ 
    description: 'End date of evaluation period',
    example: '2025-02-15T23:59:59Z' 
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({ 
    description: 'Is this period currently active',
    default: false,
    example: true 
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ 
    description: 'Survey IDs to associate with this period',
    type: [String],
    required: false,
    example: ['550e8400-e29b-41d4-a716-446655440000'] 
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  surveyIds?: string[];
}
