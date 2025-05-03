import { Controller, Get, Res, Req } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Request, Response } from 'express';
import { TaskProcessorModule } from '../task-processor.module';

@Controller('admin/queues')
export class BullBoardController {
  private serverAdapter: ExpressAdapter;

  constructor(
    @InjectQueue(TaskProcessorModule.QUEUE_NAMES.GRADING)
    private readonly gradingQueue: Queue,
    @InjectQueue(TaskProcessorModule.QUEUE_NAMES.REPORT)
    private readonly reportQueue: Queue,
    @InjectQueue(TaskProcessorModule.QUEUE_NAMES.MEDIA)
    private readonly mediaQueue: Queue,
    @InjectQueue(TaskProcessorModule.QUEUE_NAMES.DEAD_LETTER)
    private readonly deadLetterQueue: Queue,
  ) {
    this.serverAdapter = new ExpressAdapter();
    this.serverAdapter.setBasePath('/admin/queues');

    const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
      queues: [
        new BullAdapter(this.gradingQueue),
        new BullAdapter(this.reportQueue),
        new BullAdapter(this.mediaQueue),
        new BullAdapter(this.deadLetterQueue),
      ],
      serverAdapter: this.serverAdapter,
    });
  }

  @Get('*')
  async handleBullBoard(@Req() req: Request, @Res() res: Response) {
    return this.serverAdapter.getRouter()(req, res);
  }
}
