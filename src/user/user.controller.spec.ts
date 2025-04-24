import { UsersController } from './user.controller';
import { UsersService } from './providers/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

describe('MailService', () => {
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mocked-value'), // Mock the get method
          },
        },
      ],
    }).compile();

    mailService = module.get<MailService>(MailService);
  });
});


const mockUsersService = {
  create: jest.fn().mockResolvedValue({
    id: 'uuid',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashedPassword', // Include the password field for destructuring
    roleIds: [1, 2],
  }),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  deactivate: jest.fn(),
};


describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call the service method', async () => {
    const createUserDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      roleIds: [1, 2], // Assuming the roles should be passed as an array of IDs
    };

    await controller.create(createUserDto);

    // Checking if the create method on the UsersService was called with the correct arguments
    expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
  });
});
