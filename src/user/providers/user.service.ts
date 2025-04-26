import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, FindOneOptions } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { RoleEnum } from '../role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    } as FindOneOptions<User>);
    
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      const roles = await this.rolesRepository.findBy({ id: In(createUserDto.roleIds) });
      if (roles.length !== createUserDto.roleIds.length) {
        throw new BadRequestException('One or more role IDs are invalid');
      }
      user.roles = roles;
    }

    return this.usersRepository.save(user);
  }

  async findUsersByRoles(roles: RoleEnum[]): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('role.name IN (:...roles)', { roles })
      .getMany();
  }

  async findAll(queryParams: QueryUserDto) {
    const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'ASC', search, roleId, facultyAffiliation, isActive } = queryParams;
    
    const queryBuilder = this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role');
    
    if (search) {
      queryBuilder.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    if (roleId) {
      queryBuilder.andWhere('role.id = :roleId', { roleId });
    }
    
    if (facultyAffiliation) {
      queryBuilder.andWhere('user.facultyAffiliation = :facultyAffiliation', { facultyAffiliation });
    }
    
    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    queryBuilder.orderBy(`user.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    
    const [users, total] = await queryBuilder.getManyAndCount();
    
    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: Number(id) },
      relations: ['roles', 'roles.permissions']
    } as FindOneOptions<User>);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions']
    } as FindOneOptions<User>);
    
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    if (updateUserDto.roleIds) {
      const roles = await this.rolesRepository.findBy({ id: In(updateUserDto.roleIds) });
      if (roles.length !== updateUserDto.roleIds.length) {
        throw new BadRequestException('One or more role IDs are invalid');
      }
      user.roles = roles;
      delete updateUserDto.roleIds;
    }
    
    const updatedUser = Object.assign(user, updateUserDto);
    return this.usersRepository.save(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepository.remove(user);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isActive = false;
    return this.usersRepository.save(user);
  }

  async checkPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}
