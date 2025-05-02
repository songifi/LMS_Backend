import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobOptions } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { TaskEntity, TaskStatus, TaskPriority, TaskType } from './entities/task.entity';
import { TaskResultEntity } from './entities/task-result.entity';
import { TaskProcessorModule } from './task-processor.module';

@Injectable()
export class TaskProcessorService {
  private readonly logger = new Logger(TaskProcessorService.name);

  constructor(
    @InjectQueue(TaskProcessorModule.QUEUE_NAMES.GRADING)
    private readonly gradingQueue: Queue,
    @InjectQueue(TaskProcessorModule.QUEUE_NAMES.REPORT)
    private readonly reportQueue: Queue,
    @InjectQueue(TaskProcessorModule.QUEUE_NAMES.MEDIA)
    private readonly mediaQueue: Queue,
    @InjectQueue(TaskProcessorModule.QUEUE_NAMES.DEAD_LETTER)
    private readonly deadLetterQueue: Queue,
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(TaskResultEntity)
    private readonly taskResultRepository: Repository<TaskResultEntity>,
  ) {}

  /**
   * Add a task to the appropriate queue
   */
  async addTask(type: TaskType, data: any, options: {
    priority?: TaskPriority;
    scheduledFor?: Date;
  } = {}) {
    const { priority = TaskPriority.MEDIUM, scheduledFor } = options;

    // Create task entity in database
    const task = this.taskRepository.create({
      type,
      status: TaskStatus.PENDING,
      priority,
      data,
      scheduledFor,
    });
    await this.taskRepository.save(task);

    // Map priority to Bull priority (lower number = higher priority)
    const bullPriorityMap = {
      [TaskPriority.LOW]: 10,
      [TaskPriority.MEDIUM]: 5,
      [TaskPriority.HIGH]: 2,
      [TaskPriority.CRITICAL]: 1,
    };

    const jobOptions: JobOptions = {
      priority: bullPriorityMap[priority],
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: false,
      removeOnFail: false,
    };

    // Set delay if scheduledFor is provided
    if (scheduledFor && scheduledFor > new Date()) {
      jobOptions.delay = scheduledFor.getTime() - Date.now();
    }

    // Add the job to the appropriate queue
    let queue: Queue;
    let queueName: string;

    switch (type) {
      case TaskType.GRADING:
        queue = this.gradingQueue;
        queueName = TaskProcessorModule.QUEUE_NAMES.GRADING;
        break;
      case TaskType.REPORT:
        queue = this.reportQueue;
        queueName = TaskProcessorModule.QUEUE_NAMES.REPORT;
        break;
      case TaskType.MEDIA:
        queue = this.mediaQueue;
        queueName = TaskProcessorModule.QUEUE_NAMES.MEDIA;
        break;
      default:
        throw new Error(`Unknown task type: ${type}`);
    }

    const job = await queue.add(
      'process',
      { taskId: task.id, ...data },
      jobOptions,
    );

    // Update task with job ID and queue name
    await this.taskRepository.update(task.id, {
      jobId: job.id.toString(),
      queueName,
    });

    return {
      taskId: task.id,
      jobId: job.id.toString(),
    };
  }

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<TaskEntity> {
    return this.taskRepository.findOne({
      where: { id },
      relations: ['results'],
    });
  }

  /**
   * Get tasks with pagination
   */
  async getTasks(options: {
    page?: number;
    limit?: number;
    status?: TaskStatus;
    type?: TaskType;
  } = {}) {
    const { page = 1, limit = 20, status, type } = options;
    
    const query = this.taskRepository.createQueryBuilder('task');
    
    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    
    if (type) {
      query.andWhere('task.type = :type', { type });
    }
    
    query.orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    
    const [tasks, total] = await query.getManyAndCount();
    
    return {
      data: tasks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Save task result
   */
  async saveTaskResult(taskId: string, result: any, metadata?: any, processingTime?: number) {
    // Update task status
    await this.taskRepository.update(taskId, {
      status: TaskStatus.COMPLETED,
    });

    // Create task result
    const taskResult = this.taskResultRepository.create({
      taskId,
      result,
      metadata,
      processingTime,
    });

    return this.taskResultRepository.save(taskResult);
  }

  /**
   * Mark task as failed
   */
  async markTaskAsFailed(taskId: string, error: string, attempts: number) {
    await this.taskRepository.update(taskId, {
      status: TaskStatus.FAILED,
      error,
      attempts,
    });
  }

  /**
   * Move a task to dead letter queue
   */
  async moveToDeadLetterQueue(taskId: string, error: string) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // Update task status
    await this.taskRepository.update(taskId, {
      status: TaskStatus.DEAD_LETTER,
      error,
    });

    // Add to dead letter queue
    await this.deadLetterQueue.add(
      'dead-letter',
      {
        taskId: task.id,
        originalQueue: task.queueName,
        originalJobId: task.jobId,
        data: task.data,
        error,
      },
      {
        removeOnComplete: false,
        removeOnFail: false,
      },
    );
  }

  /**
   * Retry a dead letter task
   */
  async retryDeadLetterTask(taskId: string) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    if (task.status !== TaskStatus.DEAD_LETTER) {
      throw new Error(`Task is not in dead letter queue: ${taskId}`);
    }

    // Update task status back to pending
    await this.taskRepository.update(taskId, {
      status: TaskStatus.PENDING,
      error: null,
    });

    // Add back to original queue
    return this.addTask(task.type, task.data, {
      priority: task.priority,
    });
  }

  /**
   * Get queue stats
   */
  async getQueueStats() {
    const queues = [
      { name: 'Grading', queue: this.gradingQueue },
      { name: 'Report', queue: this.reportQueue },
      { name: 'Media', queue: this.mediaQueue },
      { name: 'Dead Letter', queue: this.deadLetterQueue },
    ];

    const stats = await Promise.all(
      queues.map(async ({ name, queue }) => {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
          queue.getWaitingCount(),
          queue.getActiveCount(),
          queue.getCompletedCount(),
          queue.getFailedCount(),
          queue.getDelayedCount(),
        ]);

        return {
          name,
          waiting,
          active,
          completed,
          failed,
          delayed,
        };
      }),
    );

    return stats;
  }

  /**
   * Clean up old completed jobs (run daily)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldJobs() {
    this.logger.log('Cleaning up old completed jobs');
    
    const queues = [
      this.gradingQueue,
      this.reportQueue,
      this.mediaQueue,
    ];

    // Keep completed jobs for 7 days
    const olderThan = 1000 * 60 * 60 * 24 * 7;
    
    for (const queue of queues) {
      await queue.clean(olderThan, 'completed');
    }
  }
}
