import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpdateProgressDto } from '../dto/update-progress.dto';
import { FilterProgressDto } from '../dto/filter-progress.dto';
import { ProgressService } from '../providers/progress.service';
import { EnrollmentService } from '../providers/enrollment.service';
import { NotificationService } from '../providers/notification.service';
import { EnrollmentStatus } from '../enums/enrollmentStatus.enum';
import { NotificationType } from '../enums/notificationType.enum';
import { NotificationPriority } from '../enums/notificationPriority.enum';

@Controller('course-management/progress')
export class ProgressController {
  constructor(
    private readonly progressService: ProgressService,
    private readonly enrollmentService: EnrollmentService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProgress(@Query() filters: FilterProgressDto) {
    const progress = await this.progressService.getProgress(filters);
    return {
      success: true,
      data: progress,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateProgress(@Param('id') id: string, @Body() updateProgressDto: UpdateProgressDto) {
    const progress = await this.progressService.updateProgress(id, {
      ...updateProgressDto,
      lastActivityDate: new Date(),
    });

    if (updateProgressDto.isCompleted) {
      await this.enrollmentService.updateEnrollmentStatus(
        progress.enrollmentId,
        EnrollmentStatus.COMPLETED,
      );

      await this.notificationService.sendNotification({
        recipientId: progress.studentId,
        courseId: progress.courseId,
        type: NotificationType.PROGRESS,
        message: `Congratulations! You have completed the course.`,
        priority: NotificationPriority.HIGH,
      });
    }

    return {
      success: true,
      data: progress,
    };
  }
}
