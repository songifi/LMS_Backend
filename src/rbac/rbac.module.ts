import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { AuditLog } from './entities/audit-log.entity';
import { RoleHierarchy } from './entities/role-hierarchy.entity';
import { RbacGuard } from './guards/rbac.guard';
import { RbacMetadata } from './metadata/rbac.metadata';
import { AuditLogService } from './services/audit-log.service';
import { PermissionService } from './services/permission.service';
import { RoleService } from './services/role.service';
import { RoleHierarchyService } from './services/role-hierarchy.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      Permission,
      RolePermission,
      AuditLog,
      RoleHierarchy,
    ]),
  ],
  controllers: [RbacController],
  providers: [
    RbacService,
    RbacGuard,
    RbacMetadata,
    AuditLogService,
    PermissionService,
    RoleService,
    RoleHierarchyService,
  ],
  exports: [
    RbacService,
    RbacGuard,
    RbacMetadata,
    AuditLogService,
    PermissionService,
    RoleService,
    RoleHierarchyService,
  ],
})
export class RbacModule {}