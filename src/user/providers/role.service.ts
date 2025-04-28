import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RoleEnum } from '../role.enum';
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findByName(name: RoleEnum): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { name } });
    if (!role) {
      throw new NotFoundException(`Role with name ${name} not found`);
    }
    return role;
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = new Role();
    role.name = createRoleDto.name as RoleEnum;
    role.description = createRoleDto.description || '';
    return this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async findById(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);
    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findById(id);
    await this.roleRepository.remove(role);
  }

  async getSingleRole(): Promise<Role> {
    const roles = await this.roleRepository.find({ take: 1 });
    if (roles.length === 0) {
      throw new NotFoundException('No roles found');
    }
    return roles[0];
  }

  async addPermissionToRole(roleName: RoleEnum, permission: Permission): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with name ${roleName} not found`);
    }

    role.permissions = [...role.permissions, permission];
    return this.roleRepository.save(role);
  }

  async removePermissionFromRole(roleName: RoleEnum, permissionId: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with name ${roleName} not found`);
    }

    role.permissions = role.permissions.filter(p => p.id !== permissionId);
    return this.roleRepository.save(role);
  }
}
