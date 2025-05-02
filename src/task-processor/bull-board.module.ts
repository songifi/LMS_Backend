import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BullBoardController } from './bull-board.controller';
import { TaskProcessorModule } from '../task-processor.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: TaskProcessorModule.QUEUE_NAMES.GRADING },
      { name: TaskProcessorModule.QUEUE_NAMES.REPORT },
      { name: TaskProcessorModule.QUEUE_NAMES.MEDIA },
      { name: TaskProcessorModule.QUEUE_NAMES.DEAD_LETTER },
    ),
  ],
  controllers: [BullBoardController],
})
export class BullBoardModule {}