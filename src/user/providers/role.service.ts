import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Check if role name already exists
    const existingRole = await this.rolesRepository.findOne({ where: { name: createRoleDto.name } });
    if (existingRole) {
      throw new ConflictException(`Role with name ${createRoleDto.name} already exists`);
    }

    // Create role
    const role = this.rolesRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
    });

    // Add permissions if provided
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      const permissions = await this.permissionsRepository.findBy({ id: In(createRoleDto.permissionIds) });
      role.permissions = permissions;
    }

    return this.rolesRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({
      relations: ['permissions']
    });
  }

  async findById(id: number): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions']
    });
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);
    
    // Check name uniqueness if updating name
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.rolesRepository.findOne({ where: { name: updateRoleDto.name } });
      if (existingRole) {
        throw new ConflictException(`Role with name ${updateRoleDto.name} already exists`);
      }
    }
    
    // Update basic fields
    if (updateRoleDto.name) role.name = updateRoleDto.name;
    if (updateRoleDto.description !== undefined) role.description = updateRoleDto.description;
    
    // Update permissions if provided
    if (updateRoleDto.permissionIds) {
      const permissions = await this.permissionsRepository.findBy({ id: In(updateRoleDto.permissionIds) });
      role.permissions = permissions;
    }
    
    return this.rolesRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findById(id);
    await this.rolesRepository.remove(role);
  }
}
