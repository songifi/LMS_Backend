import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from './providers/user.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';


const mockUsersRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  })),
  remove: jest.fn(),
});

const mockRolesRepository = () => ({
  findBy: jest.fn(),
});

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('UsersService', () => {
  let service: UsersService;
  let usersRepo: Repository<User>;
  let rolesRepo: Repository<Role>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockUsersRepository },
        { provide: getRepositoryToken(Role), useFactory: mockRolesRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));
    rolesRepo = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      roleIds: [1, 2],
    };

    it('should create a user', async () => {
      const mockRoles = [
        { id: 1, name: 'admin' },
        { id: 2, name: 'instructor' },
      ];
      const mockUser = {
        id: 'uuid',
        ...createUserDto,
        password: 'hashedPassword',
        roles: mockRoles,
      };

      (usersRepo.findOne as jest.Mock).mockResolvedValue(null);
      (rolesRepo.findBy as jest.Mock).mockResolvedValue(mockRoles);
      (usersRepo.create as jest.Mock).mockReturnValue(mockUser);
      (usersRepo.save as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(rolesRepo.findBy).toHaveBeenCalledWith({ id: In([1, 2]) });
    });

    it('should throw if email already exists', async () => {
      (usersRepo.findOne as jest.Mock).mockResolvedValue({ id: 'uuid', email: createUserDto.email });

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      const mockUser = { id: 'uuid', firstName: 'John' };
      (usersRepo.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findById('uuid');
      expect(result).toEqual(mockUser);
    });

    it('should throw if user not found', async () => {
      (usersRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findById('uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
