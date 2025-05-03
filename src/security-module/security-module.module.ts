import { Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScannerService } from './services/scanner.service';
import { PentestService } from './services/pentest.service';
import { SecurityIssueService } from './services/security-issue.service';
import { CveService } from './services/cve.service';
import { DisclosureService } from './services/disclosure.service';
import { ReportService } from './services/report.service';
import { SecurityController } from './controllers/security.controller';
import { SecurityIssue } from './entities/security-issue.entity';
import { CveAlert } from './entities/cve-alert.entity';
import { PentestSchedule } from './entities/pentest-schedule.entity';
import { DisclosureSubmission } from './entities/disclosure-submission.entity';
import { SecurityReport } from './entities/security-report.entity';
import { SecurityTasksService } from './services/security-tasks.service';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      SecurityIssue,
      CveAlert,
      PentestSchedule,
      DisclosureSubmission,
      SecurityReport,
    ]),
  ],
  controllers: [SecurityController],
  providers: [
    ScannerService,
    PentestService,
    SecurityIssueService,
    CveService,
    DisclosureService,
    ReportService,
    SecurityTasksService,
    NotificationService,
  ],
  exports: [
    ScannerService,
    PentestService,
    SecurityIssueService,
    CveService,
    DisclosureService,
    ReportService,
  ],
})
export class SecurityModule implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly securityTasksService: SecurityTasksService,
  ) {}

  async onModuleInit() {
    // Initialize scheduled security tasks
    await this.securityTasksService.initScheduledTasks();
  }
}
