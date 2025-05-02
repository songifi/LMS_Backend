import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  Delete,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TaskProcessorService } from './task-processor.service';
import { TaskType, TaskStatus, TaskPriority } from './entities/task.entity';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskProcessorService: TaskProcessorService) {}

  @Post()
  async createTask(@Body() createTaskDto: {
    type: TaskType;
    data: any;
    priority?: TaskPriority;
    scheduledFor?: string;
  }) {
    const { type, data, priority, scheduledFor } = createTaskDto;

    let scheduledDate: Date | undefined;
    if (scheduledFor) {
      scheduledDate = new Date(scheduledFor);
      if (isNaN(scheduledDate.getTime())) {
        throw new BadRequestException('Invalid scheduledFor date');
      }
    }

    return this.taskProcessorService.addTask(type, data, {
      priority,
      scheduledFor: scheduledDate,
    });
  }

  @Get()
  async getTasks(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: TaskStatus,
    @Query('type') type?: TaskType,
  ) {
    return this.taskProcessorService.getTasks({
      page,
      limit,
      status,
      type,
    });
  }

  @Get('stats')
  async getQueueStats() {
    return this.taskProcessorService.getQueueStats();
  }

  @Get(':id')
  async getTask(@Param('id') id: string) {
    const task = await this.taskProcessorService.getTaskById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  @Post(':id/retry')
  async retryTask(@Param('id') id: string) {
    try {
      return await this.taskProcessorService.retryDeadLetterTask(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}