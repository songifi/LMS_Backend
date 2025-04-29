import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { APP_GUARD } from "@nestjs/core"
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler"
import { AuthModule } from "./auth/auth.module"
import { MailModule } from "./mail/mail.module"
import { UsersModule } from "./user/user.module"
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard"
import { CourseManagementModule } from "./course-management/course-management.module"
import { ContentModule } from "./content/content.module"
import { AssessmentModule } from "./assessment/assessment.module"
import { ForumModule } from "./discussion-forum/discussion-forum.module"
import { FacultyModule } from "./faculty/faculty.module"
import { CacheModule } from "@nestjs/cache-manager"
import { CalendarModule } from "./calender/calender.module"
import { getSecureDatabaseConfig } from "./config/database-security.config"
import { DatabaseModule } from "./database/database.module"
import { ProgressModule } from './progress/progress.module';
import { NotificationModule } from "./notification/notification.module"
import { GradebookModule } from './gradebook/gradebook.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReportsModule } from './reports/reports.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AcademicProgramModule } from './academic-program/academic-program.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { LiveSessionModule } from './live-session/live-session.module';
import { LearningPathModule } from './learning-path/learning-path.module';
import { EcommerceModule } from './ecommerce/ecommerce.module';
import { GuardianModule } from './guardian/guardian.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getSecureDatabaseConfig,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute
      },
    ]),
    CacheModule.registerAsync({
      useFactory: () => ({
        ttl: 60,
        max: 100,
      }),
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    MailModule,
    CourseManagementModule,
    ContentModule,
    AssessmentModule,
    ForumModule,
    FacultyModule,
    CalendarModule,
    ProgressModule,
    NotificationModule,
    GradebookModule,
    AnalyticsModule,
    ReportsModule,
    FeedbackModule,
    AcademicProgramModule,
    EnrollmentModule,
    LiveSessionModule,
    LearningPathModule,
    EcommerceModule,
    GuardianModule,
  ],
  providers: [
    // Global JWT guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
