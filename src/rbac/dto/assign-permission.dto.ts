import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class AssignPermissionDto {
  @IsString()
  @IsNotEmpty()
  permissionId: string;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;
}