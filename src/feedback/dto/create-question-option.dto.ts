import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsInt, Min } from 'class-validator';

export class CreateQuestionOptionDto {
  @ApiProperty({ 
    description: 'Option text', 
    example: 'Strongly Agree' 
  })
  @IsString()
  text: string;

  @ApiProperty({ 
    description: 'Display order', 
    example: 1,
    default: 0 
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiProperty({ 
    description: 'Numeric value for analysis', 
    example: 5,
    required: false 
  })
  @IsNumber()
  @IsOptional()
  value?: number;
}
