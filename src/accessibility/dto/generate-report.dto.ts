import { IsString, IsArray, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DateRangeDto {
  @ApiProperty({
    description: 'Start date for the report',
    example: '2023-01-01',
  })
  @IsString()
  startDate: string;

  @ApiProperty({
    description: 'End date for the report',
    example: '2023-12-31',
  })
  @IsString()
  endDate: string;
}

export class GenerateReportDto {
  @ApiProperty({
    description: 'Name of the report',
    example: 'Q1 2023 Accessibility Compliance Report',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the report',
    example: 'Quarterly accessibility compliance report for the LMS',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Format of the generated report',
    example: 'pdf',
    enum: ['pdf', 'html', 'json'],
    default: 'pdf',
  })
  @IsEnum(['pdf', 'html', 'json'])
  format: 'pdf' | 'html' | 'json';

  @ApiProperty({
    description: 'Date range for the report',
    type: DateRangeDto,
  })
  @ValidateNested()
  @Type(() => DateRangeDto)
  @IsOptional()
  dateRange?: DateRangeDto;

  @ApiProperty({
    description: 'URLs to include in the report',
    example: ['https://example.com/dashboard', 'https://example.com/courses'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  urls?: string[];
}