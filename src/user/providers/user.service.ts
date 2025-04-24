import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user instance
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Assign roles if provided
    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      const roles = await this.rolesRepository.findBy({ id: In(createUserDto.roleIds) });
      if (roles.length !== createUserDto.roleIds.length) {
        throw new BadRequestException('One or more role IDs are invalid');
      }
      user.roles = roles;
    }

    // Save user
    return this.usersRepository.save(user);
  }

  async findAll(queryParams: QueryUserDto) {
    const { page = 1, limit = 10, sortBy, sortOrder, search, roleId, facultyAffiliation, isActive } = queryParams;
    
    // Build query
    const queryBuilder = this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role');
    
    // Apply filters
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
    
    // Apply sorting
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);
    
    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    
    // Execute query
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
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions']
    });
    
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    
    // Update password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    // Update role assignments if provided
    if (updateUserDto.roleIds) {
      const roles = await this.rolesRepository.findBy({ id: In(updateUserDto.roleIds) });
      if (roles.length !== updateUserDto.roleIds.length) {
        throw new BadRequestException('One or more role IDs are invalid');
      }
      user.roles = roles;
      delete updateUserDto.roleIds;
    }
    
    // Update user fields
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