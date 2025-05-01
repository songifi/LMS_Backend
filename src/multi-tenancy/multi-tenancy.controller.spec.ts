import { Test, TestingModule } from '@nestjs/testing';
import { MultiTenancyController } from './multi-tenancy.controller';
import { MultiTenancyService } from './multi-tenancy.service';

describe('MultiTenancyController', () => {
  let controller: MultiTenancyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MultiTenancyController],
      providers: [MultiTenancyService],
    }).compile();

    controller = module.get<MultiTenancyController>(MultiTenancyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
