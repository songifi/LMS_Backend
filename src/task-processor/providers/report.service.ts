import { Injectable } from '@nestjs/common';
import { TaskProcessorService } from '../task-processor/task-processor.service';
import { TaskType, TaskPriority } from '../task-processor/entities/task.entity';

@Injectable()
export class ReportService {
  constructor(private readonly taskProcessorService: TaskProcessorService) {}

  async generateReport(reportType: string, parameters: any, scheduledFor?: Date) {
    // Reports are typically lower priority but might be scheduled
    const result = await this.taskProcessorService.addTask(
      TaskType.REPORT,
      {
        reportType,
        parameters,
        requestedAt: new Date().toISOString(),
      },
      {
        priority: TaskPriority.LOW,
        scheduledFor,
      },
    );

    return result;
  }

  async getReportStatus(taskId: string) {
    const task = await this.taskProcessorService.getTaskById(taskId);
    return task;
  }
}