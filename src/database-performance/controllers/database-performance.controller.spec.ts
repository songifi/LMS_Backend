import { Test, TestingModule } from '@nestjs/testing';
import { DatabasePerformanceController } from './database-performance.controller';
import { DatabasePerformanceService } from './database-performance.service';

describe('DatabasePerformanceController', () => {
  let controller: DatabasePerformanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatabasePerformanceController],
      providers: [DatabasePerformanceService],
    }).compile();

    controller = module.get<DatabasePerformanceController>(DatabasePerformanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
