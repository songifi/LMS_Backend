import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { RoleService } from './role.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private readonly roleService: RoleService,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    // Check if a permission with same key already exists
    const existing = await this.permissionRepository.findOne({
      where: { key: createPermissionDto.key },
    });

    if (existing) {
      throw new BadRequestException(
        `Permission with key '${createPermissionDto.key}' already exists`,
      );
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async findById(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    
    return permission;
  }

  async findByKey(key: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { key },
    });
    
    if (!permission) {
      throw new NotFoundException(`Permission with key ${key} not found`);
    }
    
    return permission;
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.findById(id);
    
    // If key is being updated, check that it's unique
    if (
      updatePermissionDto.key &&
      updatePermissionDto.key !== permission.key
    ) {
      const existing = await this.permissionRepository.findOne({
        where: { key: updatePermissionDto.key },
      });
      
      if (existing) {
        throw new BadRequestException(
          `Permission with key '${updatePermissionDto.key}' already exists`,
        );
      }
    }
    
    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findById(id);
    await this.permissionRepository.remove(permission);
  }

  async checkUserPermission(
    userId: string,
    permissionKey: string,
  ): Promise<boolean> {
    // Get the permission by key
    let permission: Permission;
    try {
      permission = await this.findByKey(permissionKey);
    } catch (error) {
      // If permission doesn't exist, user doesn't have it
      return false;
    }

    // Get user roles and check permissions including inherited ones
    return this.roleService.checkUserHasPermission(userId, permission.id);
  }
}