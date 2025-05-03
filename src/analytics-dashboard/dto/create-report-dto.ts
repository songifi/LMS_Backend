import { IsString, IsOptional, IsEnum, IsArray, IsObject, ValidateNested, IsUUID, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportFormat, ReportFrequency } from '../entities/report.entity';

export class RecipientDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class CreateReportDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  dataSourceId: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @IsObject()
  query: Record<string, any>;

  @IsArray()
  @IsEnum(ReportFormat, { each: true })
  formats: ReportFormat[];

  @IsEnum(ReportFrequency)
  frequency: ReportFrequency;

  @IsOptional()
  @IsString()
  cronExpression?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipientDto)
  recipients?: RecipientDto[];

  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @IsOptional()
  @IsObject()
  template?: Record<string, any>;
}
