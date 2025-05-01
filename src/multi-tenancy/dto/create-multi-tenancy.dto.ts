import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsObject } from "class-validator"
import { TenantStatus } from "../entities/tenant.entity"

export class CreateTenantDto {
  @IsString()
  name: string

  @IsString()
  slug: string

  @IsString()
  @IsOptional()
  description?: string

  @IsBoolean()
  @IsOptional()
  isEnterprise?: boolean

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>

  @IsNumber()
  @IsOptional()
  maxUsers?: number

  @IsNumber()
  @IsOptional()
  maxConcurrentSessions?: number

  @IsString()
  @IsOptional()
  storageQuota?: string

  @IsNumber()
  @IsOptional()
  apiRequestsPerDay?: number

  @IsBoolean()
  @IsOptional()
  enableAuditLogs?: boolean

  @IsBoolean()
  @IsOptional()
  enableAdvancedFeatures?: boolean
}
