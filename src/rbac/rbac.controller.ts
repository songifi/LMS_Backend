import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { CreateHierarchyDto } from './dto/create-hierarchy.dto';
import { RbacGuard } from './guards/rbac.guard';
import { RequirePermissions } from './decorators/require-permissions.decorator';
import { GetAuditLogsDto } from './dto/get-audit-logs.dto';
import { MigrationDto } from './dto/migration.dto';

@Controller('rbac')
@UseGuards(RbacGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // Role endpoints
  @Post('roles')
  @RequirePermissions('rbac:roles:create')
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rbacService.createRole(createRoleDto);
  }

  @Get('roles')
  @RequirePermissions('rbac:roles:read')
  findAllRoles() {
    return this.rbacService.findAllRoles();
  }

  @Get('roles/:id')
  @RequirePermissions('rbac:roles:read')
  findOneRole(@Param('id') id: string) {
    return this.rbacService.findRoleById(id);
  }

  @Patch('roles/:id')
  @RequirePermissions('rbac:roles:update')
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rbacService.updateRole(id, updateRoleDto);
  }

  @Delete('roles/:id')
  @RequirePermissions('rbac:roles:delete')
  removeRole(@Param('id') id: string) {
    return this.rbacService.removeRole(id);
  }

  // Permission endpoints
  @Post('permissions')
  @RequirePermissions('rbac:permissions:create')
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.rbacService.createPermission(createPermissionDto);
  }

  @Get('permissions')
  @RequirePermissions('rbac:permissions:read')
  findAllPermissions() {
    return this.rbacService.findAllPermissions();
  }

  @Get('permissions/:id')
  @RequirePermissions('rbac:permissions:read')
  findOnePermission(@Param('id') id: string) {
    return this.rbacService.findPermissionById(id);
  }

  @Patch('permissions/:id')
  @RequirePermissions('rbac:permissions:update')
  updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.rbacService.updatePermission(id, updatePermissionDto);
  }

  @Delete('permissions/:id')
  @RequirePermissions('rbac:permissions:delete')
  removePermission(@Param('id') id: string) {
    return this.rbacService.removePermission(id);
  }

  // Role-Permission assignments
  @Post('roles/:roleId/permissions')
  @RequirePermissions('rbac:role-permissions:assign')
  assignPermissionToRole(
    @Param('roleId') roleId: string,
    @Body() assignPermissionDto: AssignPermissionDto,
  ) {
    return this.rbacService.assignPermissionToRole(roleId, assignPermissionDto);
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @RequirePermissions('rbac:role-permissions:remove')
  removePermissionFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rbacService.removePermissionFromRole(roleId, permissionId);
  }

  // Role Hierarchy endpoints
  @Post('hierarchy')
  @RequirePermissions('rbac:hierarchy:create')
  createHierarchy(@Body() createHierarchyDto: CreateHierarchyDto) {
    return this.rbacService.createHierarchy(createHierarchyDto);
  }

  @Get('hierarchy')
  @RequirePermissions('rbac:hierarchy:read')
  getHierarchy() {
    return this.rbacService.getCompleteHierarchy();
  }

  @Delete('hierarchy/:parentId/:childId')
  @RequirePermissions('rbac:hierarchy:delete')
  removeHierarchyRelation(
    @Param('parentId') parentId: string,
    @Param('childId') childId: string,
  ) {
    return this.rbacService.removeHierarchyRelation(parentId, childId);
  }

  // Check user permissions
  @Get('check-permission/:permissionKey')
  checkUserPermission(@Param('permissionKey') permissionKey: string) {
    return this.rbacService.checkUserPermission(permissionKey);
  }

  // Audit logs
  @Get('audit-logs')
  @RequirePermissions('rbac:audit-logs:read')
  getAuditLogs(@Query() getAuditLogsDto: GetAuditLogsDto) {
    return this.rbacService.getAuditLogs(getAuditLogsDto);
  }

  // Migration from existing permission system
  @Post('migration')
  @RequirePermissions('rbac:migration:execute')
  migrateFromExistingSystem(@Body() migrationDto: MigrationDto) {
    return this.rbacService.migrateFromExistingSystem(migrationDto);
  }
}