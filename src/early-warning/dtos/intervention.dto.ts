import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { InterventionMethod, InterventionType } from '../entities/intervention.entity';
import { RiskLevel } from '../entities/risk-indicator.entity';

export class CreateInterventionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(InterventionType)
  type: InterventionType;

  @IsEnum(InterventionMethod)
  method: InterventionMethod;

  @IsArray()
  @IsEnum(RiskLevel, { each: true })
  @IsOptional()
  targetRiskLevels?: RiskLevel[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetIndicators?: string[];

  @IsNumber()
  @IsOptional()
  estimatedDurationDays?: number;

  @IsObject()
  @IsOptional()
  resources?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  costEstimate?: number;

  @IsNumber()
  @IsOptional()
  successRate?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresConsent?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredRoles?: string[];

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;
}

export class UpdateInterventionDto extends CreateInterventionDto {}