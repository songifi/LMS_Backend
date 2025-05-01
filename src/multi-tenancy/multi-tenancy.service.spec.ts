import { Test, TestingModule } from '@nestjs/testing';
import { MultiTenancyService } from './multi-tenancy.service';

describe('MultiTenancyService', () => {
  let service: MultiTenancyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MultiTenancyService],
    }).compile();

    service = module.get<MultiTenancyService>(MultiTenancyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
