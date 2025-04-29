import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from '../dto/permission.dto';
import { UpdatePermissionDto } from 'src/guardian/dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    // Check if permission name already exists
    const existingPermission = await this.permissionsRepository.findOne({ 
      where: { name: createPermissionDto.name } 
    });
    
    if (existingPermission) {
      throw new ConflictException(`Permission with name ${createPermissionDto.name} already exists`);
    }

    const permission = this.permissionsRepository.create(createPermissionDto);
    return this.permissionsRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionsRepository.find();
  }

  async findById(id: number): Promise<Permission> {
    const permission = await this.permissionsRepository.findOne({ where: { id } });
    
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    
    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findById(id);
    
    // Check name uniqueness if updating name
    if (updatePermissionDto.name && updatePermissionDto.name !== permission.name) {
      const existingPermission = await this.permissionsRepository.findOne({ 
        where: { name: updatePermissionDto.name } 
      });
      
      if (existingPermission) {
        throw new ConflictException(`Permission with name ${updatePermissionDto.name} already exists`);
      }
    }
    
    const updatedPermission = Object.assign(permission, updatePermissionDto);
    return this.permissionsRepository.save(updatedPermission);
  }

  async remove(id: number): Promise<void> {
    const permission = await this.findById(id);
    await this.permissionsRepository.remove(permission);
  }
}
