import { Test, TestingModule } from '@nestjs/testing';
import { SecurityModuleController } from './security-module.controller';
import { SecurityModuleService } from './security-module.service';

describe('SecurityModuleController', () => {
  let controller: SecurityModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecurityModuleController],
      providers: [SecurityModuleService],
    }).compile();

    controller = module.get<SecurityModuleController>(SecurityModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
