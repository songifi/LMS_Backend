import { IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRoleDto } from './create-role.dto';
import { CreatePermissionDto } from './create-permission.dto';
import { CreateHierarchyDto } from './create-hierarchy.dto';

class RolePermissionAssignmentDto {
  roleId: string;
  permissionId: string;
  attributes?: Record<string, any>;
}

export class MigrationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRoleDto)
  @IsOptional()
  roles: CreateRoleDto[] = [];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionDto)
  @IsOptional()
  permissions: CreatePermissionDto[] = [];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHierarchyDto)
  @IsOptional()
  hierarchies: CreateHierarchyDto[] = [];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionAssignmentDto)
  @IsOptional()
  assignments: RolePermissionAssignmentDto[] = [];
}