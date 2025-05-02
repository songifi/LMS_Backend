import { Test, TestingModule } from '@nestjs/testing';
import { DatabasePerformanceService } from './database-performance.service';

describe('DatabasePerformanceService', () => {
  let service: DatabasePerformanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabasePerformanceService],
    }).compile();

    service = module.get<DatabasePerformanceService>(DatabasePerformanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
