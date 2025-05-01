import { ApiProperty } from '@nestjs/swagger';

export class ApplicationCountByStatusDto {
  @ApiProperty({ description: 'Status type' })
  status: string;

  @ApiProperty({ description: 'Count of applications' })
  count: number;
}

export class ApplicationCountByProgramDto {
  @ApiProperty({ description: 'Program ID' })
  programId: string;

  @ApiProperty({ description: 'Program name' })
  programName: string;

  @ApiProperty({ description: 'Count of applications' })
  count: number;
}

export class ApplicationTrendDto {
  @ApiProperty({ description: 'Date' })
  date: string;

  @ApiProperty({ description: 'Count of applications' })
  count: number;
}

export class ConversionRateDto {
  @ApiProperty({ description: 'Stage' })
  stage: string;

  @ApiProperty({ description: 'Total applications' })
  total: number;

  @ApiProperty({ description: 'Conversion rate percentage' })
  conversionRate: number;
}

export class AnalyticsResponseDto {
  @ApiProperty({ description: 'Total applications' })
  totalApplications: number;

  @ApiProperty({ description: 'Applications submitted today' })
  submittedToday: number;

  @ApiProperty({ description: 'Applications pending review' })
  pendingReview: number;

  @ApiProperty({ description: 'Applications with decisions' })
  decisionsCompleted: number;

  @ApiProperty({ description: 'Applications by status', type: [ApplicationCountByStatusDto] })
  byStatus: ApplicationCountByStatusDto[];

  @ApiProperty({ description: 'Applications by program', type: [ApplicationCountByProgramDto] })
  byProgram: ApplicationCountByProgramDto[];

  @ApiProperty({ description: 'Application submission trend', type: [ApplicationTrendDto] })
  submissionTrend: ApplicationTrendDto[];

  @ApiProperty({ description: 'Conversion rates', type: [ConversionRateDto] })
  conversionRates: ConversionRateDto[];
}
