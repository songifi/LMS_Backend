import { Test, TestingModule } from '@nestjs/testing';
import { TaskProcessorService } from './task-processor.service';

describe('TaskProcessorService', () => {
  let service: TaskProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskProcessorService],
    }).compile();

    service = module.get<TaskProcessorService>(TaskProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
