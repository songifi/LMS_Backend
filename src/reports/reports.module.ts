import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsController } from './controllers/reports.controller';
import { Report } from './entities/report.entity';
import { ReportTemplate } from './entities/report-template.entity';
import { ReportParameter } from './entities/report-parameter.entity';
import { ReportSchedule } from './entities/report-schedule.entity';
import { AnalyticsModule } from '../analytics/analytics.module';
import { SharedModule } from 'src/shared/shared.module';
import { ReportsService } from './providers/reports.service';
import { AnalyticsService } from 'src/course-management/providers/analytics.service';
import { CourseEnrollment } from 'src/course-management/entities/course-enrollment.entity';
import { CourseAttendance } from 'src/course-management/entities/course-attendance.entity';
import { CourseSession } from 'src/course-management/entities/course-session.entity';
import { CourseProgress } from 'src/course-management/entities/course-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      ReportTemplate,
      ReportParameter,
      ReportSchedule,
      CourseEnrollment,
      CourseAttendance,
      CourseSession,
      CourseProgress,
    ]),
    ScheduleModule.forRoot(),
    AnalyticsModule,
    SharedModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService,  AnalyticsService],
})
export class ReportsModule {}
