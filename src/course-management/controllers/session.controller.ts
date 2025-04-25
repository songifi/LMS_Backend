import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateSessionDto } from '../dto/create-session.dto';
import { FilterSessionsDto } from '../dto/filter-sessions.dto';
import { SessionService } from '../providers/session.service';
import { NotificationService } from '../providers/notification.service';
import { EnrollmentService } from '../providers/enrollment.service';
import { NotificationType } from '../enums/notificationType.enum';
import { NotificationPriority } from '../enums/notificationPriority.enum';

@Controller('course-management/sessions')
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly notificationService: NotificationService,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createSession(@Body() createSessionDto: CreateSessionDto, @Request() req) {
    const session = await this.sessionService.createSession(createSessionDto);

    const enrolledStudents = await this.enrollmentService.getEnrolledStudents(
      createSessionDto.courseId,
    );

    for (const student of enrolledStudents) {
      await this.notificationService.sendNotification({
        recipientId: student.studentId,
        courseId: session.courseId,
        sessionId: session.id,
        type: NotificationType.SESSION,
        message: `New session scheduled: ${session.title}`,
        priority: NotificationPriority.MEDIUM,
      });
    }

    return {
      success: true,
      data: session,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getSessions(@Query() filters: FilterSessionsDto) {
    const sessions = await this.sessionService.getSessions(filters);
    return {
      success: true,
      data: sessions,
    };
  }
}
