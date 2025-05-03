import { IsString, IsOptional, IsBoolean, IsArray, IsObject, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { WidgetType, ChartType } from '../entities/dashboard-widget.entity';

export class CreateWidgetDto {
  @IsString()
  title: string;

  @IsString()
  type: WidgetType;

  @IsOptional()
  @IsString()
  chartType?: ChartType;

  @IsObject()
  config: Record<string, any>;

  @IsOptional()
  @IsObject()
  query?: Record<string, any>;

  @IsOptional()
  @IsUUID()
  metricId?: string;

  @IsOptional()
  @IsNumber()
  refreshInterval?: number;
  
  @IsNumber()
  positionX: number;
  
  @IsNumber()
  positionY: number;
  
  @IsNumber()
  width: number;
  
  @IsNumber()
  height: number;
}

export class CreateDashboardDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsObject()
  layout?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWidgetDto)
  widgets?: CreateWidgetDto[];
}

import { IsNumber } from 'class-validator';
