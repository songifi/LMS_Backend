import { Test, TestingModule } from '@nestjs/testing';
import { SecurityModuleService } from './security-module.service';

describe('SecurityModuleService', () => {
  let service: SecurityModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityModuleService],
    }).compile();

    service = module.get<SecurityModuleService>(SecurityModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
