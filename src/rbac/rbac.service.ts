import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { AuditLog } from './entities/audit-log.entity';
import { RoleHierarchy } from './entities/role-hierarchy.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { CreateHierarchyDto } from './dto/create-hierarchy.dto';
import { GetAuditLogsDto } from './dto/get-audit-logs.dto';
import { MigrationDto } from './dto/migration.dto';
import { AuditLogService } from './services/audit-log.service';
import { PermissionService } from './services/permission.service';
import { RoleService } from './services/role.service';
import { RoleHierarchyService } from './services/role-hierarchy.service';
import { RequestContextService } from '../shared/services/request-context.service';

@Injectable()
export class RbacService {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly permissionService: PermissionService,
    private readonly roleService: RoleService,
    private readonly roleHierarchyService: RoleHierarchyService,
    private readonly requestContextService: RequestContextService,
  ) {}

  // Role methods
  async createRole(createRoleDto: CreateRoleDto) {
    const role = await this.roleService.create(createRoleDto);
    await this.auditLogService.logAction(
      'Role created',
      `Role ${role.name} created`,
      'role',
      role.id,
    );
    return role;
  }

  async findAllRoles() {
    return this.roleService.findAll();
  }

  async findRoleById(id: string) {
    const role = await this.roleService.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleService.update(id, updateRoleDto);
    await this.auditLogService.logAction(
      'Role updated',
      `Role ${role.name} updated`,
      'role',
      role.id,
    );
    return role;
  }

  async removeRole(id: string) {
    const role = await this.roleService.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    
    // Check for role hierarchy dependencies
    const hierarchyRelations = await this.roleHierarchyService.findByRoleId(id);
    if (hierarchyRelations.length > 0) {
      throw new BadRequestException(
        'Cannot delete role that is part of role hierarchy',
      );
    }

    await this.roleService.remove(id);
    await this.auditLogService.logAction(
      'Role deleted',
      `Role ${role.name} deleted`,
      'role',
      role.id,
    );
    return { success: true };
  }

  // Permission methods
  async createPermission(createPermissionDto: CreatePermissionDto) {
    const permission = await this.permissionService.create(createPermissionDto);
    await this.auditLogService.logAction(
      'Permission created',
      `Permission ${permission.key} created`,
      'permission',
      permission.id,
    );
    return permission;
  }

  async findAllPermissions() {
    return this.permissionService.findAll();
  }

  async findPermissionById(id: string) {
    const permission = await this.permissionService.findById(id);
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return permission;
  }

  async updatePermission(id: string, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionService.update(
      id,
      updatePermissionDto,
    );
    await this.auditLogService.logAction(
      'Permission updated',
      `Permission ${permission.key} updated`,
      'permission',
      permission.id,
    );
    return permission;
  }

  async removePermission(id: string) {
    const permission = await this.permissionService.findById(id);
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    await this.permissionService.remove(id);
    await this.auditLogService.logAction(
      'Permission deleted',
      `Permission ${permission.key} deleted`,
      'permission',
      permission.id,
    );
    return { success: true };
  }

  // Role-Permission assignment methods
  async assignPermissionToRole(
    roleId: string,
    assignPermissionDto: AssignPermissionDto,
  ) {
    const role = await this.roleService.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const permission = await this.permissionService.findById(
      assignPermissionDto.permissionId,
    );
    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${assignPermissionDto.permissionId} not found`,
      );
    }

    const result = await this.roleService.assignPermission(
      roleId,
      assignPermissionDto.permissionId,
      assignPermissionDto.attributes || {},
    );

    await this.auditLogService.logAction(
      'Permission assigned to role',
      `Permission ${permission.key} assigned to role ${role.name}`,
      'role_permission',
      `${roleId}_${assignPermissionDto.permissionId}`,
    );

    return result;
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    const role = await this.roleService.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const permission = await this.permissionService.findById(permissionId);
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${permissionId} not found`);
    }

    await this.roleService.removePermission(roleId, permissionId);

    await this.auditLogService.logAction(
      'Permission removed from role',
      `Permission ${permission.key} removed from role ${role.name}`,
      'role_permission',
      `${roleId}_${permissionId}`,
    );

    return { success: true };
  }

  // Role Hierarchy methods
  async createHierarchy(createHierarchyDto: CreateHierarchyDto) {
    const { parentRoleId, childRoleId } = createHierarchyDto;

    const parentRole = await this.roleService.findById(parentRoleId);
    if (!parentRole) {
      throw new NotFoundException(`Parent role with ID ${parentRoleId} not found`);
    }

    const childRole = await this.roleService.findById(childRoleId);
    if (!childRole) {
      throw new NotFoundException(`Child role with ID ${childRoleId} not found`);
    }

    // Check for circular dependencies
    if (await this.roleHierarchyService.wouldCreateCircularDependency(parentRoleId, childRoleId)) {
      throw new BadRequestException(
        'This relationship would create a circular dependency in the role hierarchy',
      );
    }

    const hierarchy = await this.roleHierarchyService.create({
      parentRoleId,
      childRoleId,
    });

    await this.auditLogService.logAction(
      'Hierarchy relation created',
      `Role hierarchy: ${parentRole.name} is now parent of ${childRole.name}`,
      'role_hierarchy',
      hierarchy.id,
    );

    return hierarchy;
  }

  async getCompleteHierarchy() {
    return this.roleHierarchyService.getCompleteHierarchy();
  }

  async removeHierarchyRelation(parentId: string, childId: string) {
    const parentRole = await this.roleService.findById(parentId);
    if (!parentRole) {
      throw new NotFoundException(`Parent role with ID ${parentId} not found`);
    }

    const childRole = await this.roleService.findById(childId);
    if (!childRole) {
      throw new NotFoundException(`Child role with ID ${childId} not found`);
    }

    await this.roleHierarchyService.removeRelation(parentId, childId);

    await this.auditLogService.logAction(
      'Hierarchy relation removed',
      `Role hierarchy: ${parentRole.name} is no longer parent of ${childRole.name}`,
      'role_hierarchy',
      `${parentId}_${childId}`,
    );

    return { success: true };
  }

  // Permission checking methods
  async checkUserPermission(permissionKey: string) {
    const user = this.requestContextService.getCurrentUser();
    if (!user) {
      return { hasPermission: false };
    }

    const hasPermission = await this.permissionService.checkUserPermission(
      user.id,
      permissionKey,
    );

    return { hasPermission };
  }

  // Audit logs
  async getAuditLogs(getAuditLogsDto: GetAuditLogsDto) {
    return this.auditLogService.getLogs(getAuditLogsDto);
  }

  // Migration from existing permission system
  async migrateFromExistingSystem(migrationDto: MigrationDto) {
    // Start a transaction for the migration
    const result = {
      rolesCreated: 0,
      permissionsCreated: 0,
      hierarchiesCreated: 0,
      assignmentsCreated: 0,
    };

    try {
      // 1. Create roles
      for (const roleData of migrationDto.roles) {
        await this.createRole(roleData);
        result.rolesCreated++;
      }

      // 2. Create permissions
      for (const permissionData of migrationDto.permissions) {
        await this.createPermission(permissionData);
        result.permissionsCreated++;
      }

      // 3. Create hierarchies
      for (const hierarchyData of migrationDto.hierarchies) {
        await this.createHierarchy(hierarchyData);
        result.hierarchiesCreated++;
      }

      // 4. Assign permissions to roles
      for (const assignment of migrationDto.assignments) {
        await this.assignPermissionToRole(
          assignment.roleId,
          {
            permissionId: assignment.permissionId,
            attributes: assignment.attributes,
          },
        );
        result.assignmentsCreated++;
      }

      await this.auditLogService.logAction(
        'System migration',
        `Migration completed: ${JSON.stringify(result)}`,
        'system',
        'migration',
      );

      return {
        success: true,
        ...result,
      };
    } catch (error) {
      // In a real implementation, you'd want proper transaction rollback
      await this.auditLogService.logAction(
        'System migration failed',
        `Migration error: ${error.message}`,
        'system',
        'migration',
      );
      throw error;
    }
  }
}