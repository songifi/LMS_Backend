import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  name: string;

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