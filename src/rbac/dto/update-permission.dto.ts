import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreatePermissionDto } from './create-permission.dto';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  @IsString()
  @IsOptional()
  key?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  resource?: string;

  @IsString()
  @IsOptional()
  action?: string;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}