import { Process, Processor, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { TaskProcessorService } from '../task-processor.service';
import { TaskProcessorModule } from '../task-processor.module';

@Processor(TaskProcessorModule.QUEUE_NAMES.MEDIA)
export class MediaProcessor {
  private readonly logger = new Logger(MediaProcessor.name);

  constructor(private readonly taskProcessorService: TaskProcessorService) {}

  @Process('process')
  async processMediaTask(job: Job<any>) {
    const { taskId, mediaType, fileUrl, options } = job.data;
    this.logger.debug(`Processing media task ${taskId} for ${mediaType}`);

    const startTime = Date.now();

    try {
      // Simulate media processing (transcoding, resizing, etc.)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Example media processing result
      const result = {
        mediaType,
        originalUrl: fileUrl,
        processedUrl: `https://example.com/processed/${mediaType}-${Date.now()}.mp4`,
        thumbnailUrl: `https://example.com/thumbnails/${mediaType}-${Date.now()}.jpg`,
        duration: 120, // seconds
        resolution: '1280x720',
        format: 'mp4',
        size: 15000000, // bytes
        metadata: {
          // Additional metadata about the processed media
        },
      };

      const processingTime = Date.now() - startTime;

      // Save the result
      await this.taskProcessorService.saveTaskResult(
        taskId,
        result,
        { jobId: job.id.toString(), options },
        processingTime,
      );

      return result;
    } catch (error) {
      this.logger.error(`Error processing media task ${taskId}:`, error.stack);
      throw error;
    }
  }

  @OnQueueCompleted()
  async onCompleted(job: Job, result: any) {
    this.logger.debug(`Media job ${job.id} completed`);
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    const { taskId } = job.data;
    this.logger.error(`Media job ${job.id} failed: ${error.message}`);

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
