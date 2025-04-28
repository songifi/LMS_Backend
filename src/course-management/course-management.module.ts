// src/course-management/course-management.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { CourseSession } from './entities/course-session.entity';
import { CourseAttendance } from './entities/course-attendance.entity';
import { CourseProgress } from './entities/course-progress.entity';
import { CourseNotification } from './entities/course-notification.entity';
import { User } from '../user/entities/user.entity';

// Controllers
import { EnrollmentController } from './controllers/enrollment.controller';
import { SessionController } from './controllers/session.controller';
import { AttendanceController } from './controllers/attendance.controller';
import { ProgressController } from './controllers/progress.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { EnrollmentService } from './providers/enrollment.service';
import { SessionService } from './providers/session.service';
import { AttendanceService } from './providers/attendance.service';
import { ProgressService } from './providers/progress.service';
import { AnalyticsService } from './providers/analytics.service';
import { NotificationService } from './providers/notification.service';
import { CourseManagementService } from './course-management.service';

// Services

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseEnrollment,
      CourseSession,
      CourseAttendance,
      CourseProgress,
      CourseNotification,
      User,
    ]),
    ConfigModule,
  ],
  controllers: [
    EnrollmentController,
    SessionController,
    AttendanceController,
    ProgressController,
    AnalyticsController,
  ],
  providers: [
    EnrollmentService,
    SessionService,
    AttendanceService,
    ProgressService,
    AnalyticsService,
    NotificationService,
    CourseManagementService,
  ],
  exports: [
    EnrollmentService,
    SessionService,
    AttendanceService,
    ProgressService,
    AnalyticsService,
    NotificationService,
    CourseManagementService, 
  ],
})
export class CourseManagementModule {}
