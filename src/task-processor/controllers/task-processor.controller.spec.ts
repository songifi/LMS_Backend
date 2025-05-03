import { Test, TestingModule } from '@nestjs/testing';
import { TaskProcessorController } from './task-processor.controller';
import { TaskProcessorService } from './task-processor.service';

describe('TaskProcessorController', () => {
  let controller: TaskProcessorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskProcessorController],
      providers: [TaskProcessorService],
    }).compile();

    controller = module.get<TaskProcessorController>(TaskProcessorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
