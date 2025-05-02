import { Injectable } from '@nestjs/common';
import { TaskProcessorService } from '../task-processor/task-processor.service';
import { TaskType, TaskPriority } from '../task-processor/entities/task.entity';

@Injectable()
export class GradingService {
  constructor(private readonly taskProcessorService: TaskProcessorService) {}

  async gradeSubmission(submissionId: string, courseId: string, priority: TaskPriority = TaskPriority.MEDIUM) {
    // Add task to queue
    const result = await this.taskProcessorService.addTask(
      TaskType.GRADING,
      {
        submissionId,
        courseId,
        submittedAt: new Date().toISOString(),
      },
      { priority },
    );

    return result;
  }

  async getGradingResult(taskId: string) {
    const task = await this.taskProcessorService.getTaskById(taskId);
    return task;
  }
}
