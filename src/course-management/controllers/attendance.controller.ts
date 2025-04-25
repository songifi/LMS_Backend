import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RecordAttendanceDto } from '../dto/record-attendance.dto';
import { FilterAttendanceDto } from '../dto/filter-attendance.dto';
import { ProgressService } from '../providers/progress.service';
import { AttendanceService } from '../providers/attendance.service';
import { NotificationService } from '../providers/notification.service';
import { CourseAttendance } from '../entities/course-attendance.entity';
import { NotificationType } from '../enums/notificationType.enum';
import { NotificationPriority } from '../enums/notificationPriority.enum';

@Controller('course-management/attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly progressService: ProgressService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async recordAttendance(@Body() recordAttendanceDto: RecordAttendanceDto, @Request() req) {
    const attendanceRecords: CourseAttendance[] = [];

    // Get session details to include courseId
    const session = await this.attendanceService.getSessionDetails(recordAttendanceDto.sessionId);

    // Bulk attendance recording
    for (const record of recordAttendanceDto.records) {
      const attendance = await this.attendanceService.recordAttendance({
        sessionId: recordAttendanceDto.sessionId,
        courseId: session.courseId,
        studentId: record.studentId,
        status: record.status,
        recordedAt: new Date(),
        recordedBy: req.user.id,
        justification: record.justification,
      });

      attendanceRecords.push(attendance);

      // Update student progress based on attendance
      await this.progressService.updateProgressFromAttendance(
        record.studentId,
        recordAttendanceDto.sessionId,
        record.status,
      );

      // Send notification for absence
      if (record.status === 'ABSENT' && !record.justification) {
        await this.notificationService.sendNotification({
          recipientId: record.studentId,
          courseId: session.courseId,
          sessionId: recordAttendanceDto.sessionId,
          type: NotificationType.ATTENDANCE,
          message: `You were marked absent for a session. Please provide justification if needed.`,
          priority: NotificationPriority.HIGH,
        });
      }
    }

    return {
      success: true,
      data: attendanceRecords,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAttendanceRecords(@Query() filters: FilterAttendanceDto) {
    const attendance = await this.attendanceService.getAttendanceRecords(filters);
    return {
      success: true,
      data: attendance,
    };
  }
}
