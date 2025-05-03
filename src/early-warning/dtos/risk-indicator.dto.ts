import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateIf } from 'class-validator';
import { DataSourceType, RiskLevel, ThresholdType } from '../entities/risk-indicator.entity';

export class CreateRiskIndicatorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DataSourceType)
  dataSource: DataSourceType;

  @IsEnum(ThresholdType)
  thresholdType: ThresholdType;

  @IsNotEmpty()
  thresholdValue: any;

  @ValidateIf(o => o.thresholdType === ThresholdType.BETWEEN)
  @IsNotEmpty()
  thresholdUpperValue?: any;

  @IsEnum(RiskLevel)
  riskLevel: RiskLevel;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  customLogic?: Record<string, any>;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdateRiskIndicatorDto extends CreateRiskIndicatorDto {
  @IsBoolean()
  @IsOptional()
  isSystemDefined?: boolean;
}