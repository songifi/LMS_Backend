import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRemediationTaskDto {
  @ApiProperty({
    description: 'Title of the remediation task',
    example: 'Fix missing alt text on logo image',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Description of the remediation task',
    example: 'Add appropriate alt text to the logo image on the course header',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Status of the remediation task',
    example: 'in_progress',
    enum: ['pending', 'in_progress', 'completed', 'canceled'],
  })
  @IsEnum(['pending', 'in_progress', 'completed', 'canceled'])
  @IsOptional()
  status?: 'pending' | 'in_progress' | 'completed' | 'canceled';

  @ApiProperty({
    description: 'Person assigned to the task',
    example: 'john.doe@example.com',
  })
  @IsString()
  @IsOptional()
  assignee?: string;

  @ApiProperty({
    description: 'Notes about the remediation progress',
    example: 'Added alt text, awaiting review',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Priority level of the task',
    example: 'high',
    enum: ['high', 'medium', 'low'],
  })
  @IsEnum(['high', 'medium', 'low'])
  @IsOptional()
  priority?: 'high' | 'medium' | 'low';

  @ApiProperty({
    description: 'Estimated effort to complete the task',
    example: 'medium',
  })
  @IsString()
  @IsOptional()
  estimatedEffort?: string;
}