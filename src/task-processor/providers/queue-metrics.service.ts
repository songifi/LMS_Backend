import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { makeGaugeProvider, Gauge } from 'nestjs-prometheus';
import { Interval } from '@nestjs/schedule';
import { TaskProcessorModule } from '../task-processor.module';
import { InjectMetric } from 'nestjs-prometheus';

// Create gauge metrics providers
export const queueWaitingJobsMetric = makeGaugeProvider({
  name: 'bull_queue_waiting_jobs',
  help: 'Number of jobs waiting in queue',
  labelNames: ['queue'],
});

export const queueActiveJobsMetric = makeGaugeProvider({
  name: 'bull_queue_active_jobs',
  help: 'Number of active jobs in queue',
  labelNames: ['queue'],
});

export const queueCompletedJobsMetric = makeGaugeProvider({
  name: 'bull_queue_completed_jobs',
  help: 'Number of completed jobs in queue',
  labelNames: ['queue'],
});

export const queueFailedJobsMetric = makeGaugeProvider({
  name: 'bull_queue_failed_jobs',
  help: 'Number of failed jobs in queue',
  labelNames: ['queue'],
});

export const queueDelayedJobsMetric = makeGaugeProvider({
  name: 'bull_queue_delayed_jobs',
  help: 'Number of delayed jobs in queue',
  labelNames: ['queue'],
});

export const jobProcessingTimeMetric = makeGaugeProvider({
  name: 'bull_job_processing_time',
  help: 'Processing time of jobs in milliseconds',
  labelNames: ['queue', 'status'],
});

@Injectable()
export class QueueMetricsService implements OnModuleInit {
  constructor(
    @InjectQueue(TaskProcessorModule.QUEUE_NAMES.GRADING)
    private readonly gradingQueue: Queue,
    @InjectQueue(TaskProcessorModule.QUEUE_NAMES.REPORT)
    private readonly reportQueue: Queue,
    @InjectQueue(TaskProcessorModule.QUEUE_NAMES.MEDIA)
    private readonly mediaQueue: Queue,
    @InjectQueue(TaskProcessorModule.QUEUE_NAMES.DEAD_LETTER)
    private readonly deadLetterQueue: Queue,
    @InjectMetric('bull_queue_waiting_jobs')
    private readonly waitingJobsMetric: Gauge<string>,
    @InjectMetric('bull_queue_active_jobs')
    private readonly activeJobsMetric: Gauge<string>,
    @InjectMetric('bull_queue_completed_jobs')
    private readonly completedJobsMetric: Gauge<string>,
    @InjectMetric('bull_queue_failed_jobs')
    private readonly failedJobsMetric: Gauge<string>,
    @InjectMetric('bull_queue_delayed_jobs')
    private readonly delayedJobsMetric: Gauge<string>,
    @InjectMetric('bull_job_processing_time')
    private readonly processingTimeMetric: Gauge<string>,
  ) {}

  onModuleInit() {
    // Set up listeners to track job processing times
    this.setupProcessingTimeTracking(this.gradingQueue, TaskProcessorModule.QUEUE_NAMES.GRADING);
    this.setupProcessingTimeTracking(this.reportQueue, TaskProcessorModule.QUEUE_NAMES.REPORT);
    this.setupProcessingTimeTracking(this.mediaQueue, TaskProcessorModule.QUEUE_NAMES.MEDIA);
  }

  private setupProcessingTimeTracking(queue: Queue, queueName: string) {
    queue.on('completed', (job, result) => {
      const processingTime = Date.now() - new Date(job.processedOn).getTime();
      this.processingTimeMetric.labels(queueName, 'completed').set(processingTime);
    });

    queue.on('failed', (job, error) => {
      if (job.processedOn) {
        const processingTime = Date.now() - new Date(job.processedOn).getTime();
        this.processingTimeMetric.labels(queueName, 'failed').set(processingTime);
      }
    });
  }

  @Interval(10000) // Update metrics every 10 seconds
  async updateMetrics() {
    await this.updateQueueMetrics(this.gradingQueue, TaskProcessorModule.QUEUE_NAMES.GRADING);
    await this.updateQueueMetrics(this.reportQueue, TaskProcessorModule.QUEUE_NAMES.REPORT);
    await this.updateQueueMetrics(this.mediaQueue, TaskProcessorModule.QUEUE_NAMES.MEDIA);
    await this.updateQueueMetrics(this.deadLetterQueue, TaskProcessorModule.QUEUE_NAMES.DEAD_LETTER);
  }

  private async updateQueueMetrics(queue: Queue, queueName: string) {
    const waiting = await queue.getWaitingCount();
    const active = await queue.getActiveCount();
    const completed = await queue.getCompletedCount();
    const failed = await queue.getFailedCount();
    const delayed = await queue.getDelayedCount();

    this.waitingJobsMetric.labels(queueName).set(waiting);
    this.activeJobsMetric.labels(queueName).set(active);
    this.completedJobsMetric.labels(queueName).set(completed);
    this.failedJobsMetric.labels(queueName).set(failed);
    this.delayedJobsMetric.labels(queueName).set(delayed);
  }
}
