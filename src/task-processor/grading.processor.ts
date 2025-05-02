import { Process, Processor, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { TaskProcessorService } from '../task-processor.service';
import { TaskProcessorModule } from '../task-processor.module';

@Processor(TaskProcessorModule.QUEUE_NAMES.GRADING)
export class GradingProcessor {
  private readonly logger = new Logger(GradingProcessor.name);

  constructor(private readonly taskProcessorService: TaskProcessorService) {}

  @Process('process')
  async processGradingTask(job: Job<any>) {
    const { taskId, submissionId, courseId } = job.data;
    this.logger.debug(`Processing grading task ${taskId} for submission ${submissionId}`);

    const startTime = Date.now();

    try {
      // Simulate actual grading work
      // In a real implementation, you would connect to your grading service/logic
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Example grading result
      const result = {
        submissionId,
        courseId,
        score: Math.floor(Math.random() * 100),
        feedback: 'This is automated feedback for the submission',
        gradedAt: new Date().toISOString(),
      };

      const processingTime = Date.now() - startTime;

      // Save the result
      await this.taskProcessorService.saveTaskResult(
        taskId,
        result,
        { jobId: job.id.toString() },
        processingTime,
      );

      return result;
    } catch (error) {
      this.logger.error(`Error processing grading task ${taskId}:`, error.stack);
      throw error;
    }
  }

  @OnQueueCompleted()
  async onCompleted(job: Job, result: any) {
    this.logger.debug(`Grading job ${job.id} completed with result: ${JSON.stringify(result)}`);
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    const { taskId } = job.data;
    this.logger.error(`Grading job ${job.id} failed: ${error.message}`);

    // If this is the final retry, move to dead letter queue
    if (job.attemptsMade >= job.opts.attempts) {
      await this.taskProcessorService.moveToDeadLetterQueue(
        taskId,
        error.message,
      );
    } else {
      // Otherwise, just mark as failed but it will be retried
      await this.taskProcessorService.markTaskAsFailed(
        taskId,
        error.message,
        job.attemptsMade,
      );
    }
  }
}