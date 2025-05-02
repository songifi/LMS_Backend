import { IsOptional, IsEnum, IsString } from 'class-validator';

export enum ReportFormat {
  PDF = 'pdf',
  HTML = 'html',
  JSON = 'json',
}

export class AccreditationReportQueryDto {
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat = ReportFormat.PDF;

  @IsOptional()
  @IsString()
  accreditationBody?: string;
}