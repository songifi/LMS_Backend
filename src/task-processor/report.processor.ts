import { Process, Processor, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { TaskProcessorService } from '../task-processor.service';
import { TaskProcessorModule } from '../task-processor.module';

@Processor(TaskProcessorModule.QUEUE_NAMES.REPORT)
export class ReportProcessor {
  private readonly logger = new Logger(ReportProcessor.name);

  constructor(private readonly taskProcessorService: TaskProcessorService) {}

  @Process('process')
  async processReportTask(job: Job<any>) {
    const { taskId, reportType, parameters } = job.data;
    this.logger.debug(`Processing report task ${taskId} of type ${reportType}`);

    const startTime = Date.now();

    try {
      // Simulate actual report generation
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Example report result
      const result = {
        reportType,
        parameters,
        generatedAt: new Date().toISOString(),
        data: {
          // Sample report data
          summary: {
            totalStudents: 150,
            averageScore: 78.5,
            passRate: 0.85,
          },
          details: [
            // Would contain detailed report information
          ],
        },
        downloadUrl: `https://example.com/reports/${reportType}-${Date.now()}.pdf`,
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
      this.logger.error(`Error processing report task ${taskId}:`, error.stack);
      throw error;
    }
  }

  @OnQueueCompleted()
  async onCompleted(job: Job, result: any) {
    this.logger.debug(`Report job ${job.id} completed`);
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    const { taskId } = job.data;
    this.logger.error(`Report job ${job.id} failed: ${error.message}`);

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