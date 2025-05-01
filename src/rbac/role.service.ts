import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UserRoleService } from '../../shared/services/user-role.service';
import { RoleHierarchyService } from './role-hierarchy.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    private readonly userRoleService: UserRoleService,
    private readonly roleHierarchyService: RoleHierarchyService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Check if role with same name already exists
    const existing = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existing) {
      throw new BadRequestException(
        `Role with name '${createRoleDto.name}' already exists`,
      );
    }

    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);
    
    // If name is being updated, check that it's unique
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existing = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });
      
      if (existing) {
        throw new BadRequestException(
          `Role with name '${updateRoleDto.name}' already exists`,
        );
      }
    }
    
    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findById(id);
    await this.roleRepository.remove(role);
  }

  async findUserRoles(userId: string): Promise<Role[]> {
    const userRoleIds = await this.userRoleService.getUserRoleIds(userId);
    
    if (!userRoleIds.length) {
      return [];
    }
    
    return this.roleRepository.find({
      where: { id: In(userRoleIds) },
    });
  }

  async assignPermission(
    roleId: string,
    permissionId: string,
    attributes: Record<string, any> = {},
  ): Promise<RolePermission> {
    // Check if role-permission already exists
    const existing = await this.rolePermissionRepository.findOne({
      where: { roleId, permissionId },
    });

    if (existing) {
      // Update the attributes if the assignment already exists
      existing.attributes = attributes;
      return this.rolePermissionRepository.save(existing);
    }

    // Create a new role-permission assignment
    const rolePermission = this.rolePermissionRepository.create({
      roleId,
      permissionId,
      attributes,
    });

    return this.rolePermissionRepository.save(rolePermission);
  }

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    const rolePermission = await this.rolePermissionRepository.findOne({
      where: { roleId, permissionId },
    });

    if (!rolePermission) {
      throw new NotFoundException(
        `Permission assignment not found for role ${roleId} and permission ${permissionId}`,
      );
    }

    await this.rolePermissionRepository.remove(rolePermission);
  }

  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    return this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });
  }

  async checkUserHasPermission(
    userId: string,
    permissionId: string,
  ): Promise<boolean> {
    // Get user directly assigned roles
    const userRoleIds = await this.userRoleService.getUserRoleIds(userId);
    
    if (!userRoleIds.length) {
      return false;
    }

    // Get all inherited roles (the full hierarchy)
    const allUserRoleIds = await this.roleHierarchyService.getAllUserRoleIds(userRoleIds);

    // Check if any of the user's roles (direct or inherited) have the permission
    const rolePermission = await this.rolePermissionRepository.findOne({
      where: {
        roleId: In(allUserRoleIds),
        permissionId,
      },
    });

    return !!rolePermission;
  }

  async getPermissionsByRoleIds(roleIds: string[]): Promise<RolePermission[]> {
    if (!roleIds.length) {
      return [];
    }

    return this.rolePermissionRepository.find({
      where: { roleId: In(roleIds) },
      relations: ['permission'],
    });
  }
}