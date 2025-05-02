import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ManualIssueDto {
  @ApiProperty({
    description: 'WCAG criterion identifier',
    example: '1.1.1',
  })
  @IsString()
  wcagCriterion: string;

  @ApiProperty({
    description: 'Description of the issue',
    example: 'Image missing alt text',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Impact level of the issue',
    example: 'serious',
    enum: ['critical', 'serious', 'moderate', 'minor'],
  })
  @IsString()
  impactLevel: 'critical' | 'serious' | 'moderate' | 'minor';

  @ApiProperty({
    description: 'URL where the issue was found',
    example: 'https://example.com/course-page',
  })
  @IsString()
  url: string;

  @ApiProperty({
    description: 'HTML snippet showing the issue',
    example: '<img src="logo.png">',
  })
  @IsString()
  @IsOptional()
  htmlSnippet?: string;

  @ApiProperty({
    description: 'CSS/XPath selector for the element',
    example: 'header > img',
  })
  @IsString()
  @IsOptional()
  elementPath?: string;

  @ApiProperty({
    description: 'Recommendations for fixing the issue',
    example: 'Add descriptive alt text to the image',
  })
  @IsString()
  @IsOptional()
  recommendations?: string;
}

export class CreateManualAuditDto {
  @ApiProperty({
    description: 'Name of the audit',
    example: 'Course Dashboard Accessibility Audit',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the audit',
    example: 'Manual accessibility audit of the student dashboard',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Name of the person conducting the audit',
    example: 'Jane Smith',
  })
  @IsString()
  @IsOptional()
  auditor?: string;

  @ApiProperty({
    description: 'Issues discovered during the audit',
    type: [ManualIssueDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManualIssueDto)
  @IsOptional()
  issues?: ManualIssueDto[];

  @ApiProperty({
    description: 'Additional metadata for the audit',
    example: { 
      browser: 'Chrome 90',
      screenReader: 'NVDA 2021.1',
      assistiveTechnology: ['NVDA', 'VoiceOver']
    },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}