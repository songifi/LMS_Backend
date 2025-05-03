import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Controllers
import { AnalyticsController } from './controllers/analytics.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { ReportController } from './controllers/report.controller';

// Services
import { AnalyticsService } from './services/analytics.service';
import { DashboardService } from './services/dashboard.service';
import { EtlService } from './services/etl.service';
import { ReportService } from './services/report.service';
import { SchedulerService } from './services/scheduler.service';

// Entities
import { Dashboard } from './entities/dashboard.entity';
import { DashboardWidget } from './entities/dashboard-widget.entity';
import { DataSource } from './entities/data-source.entity';
import { EtlJob } from './entities/etl-job.entity';
import { Metric } from './entities/metric.entity';
import { Report } from './entities/report.entity';

// Jobs
import { EtlRunnerJob } from './jobs/etl-runner.job';
import { ReportSchedulerJob } from './jobs/report-scheduler.job';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dashboard,
      DashboardWidget,
      DataSource,
      EtlJob,
      Metric,
      Report,
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    AnalyticsController,
    DashboardController,
    ReportController,
  ],
  providers: [
    AnalyticsService,
    DashboardService,
    EtlService,
    ReportService,
    SchedulerService,
    EtlRunnerJob,
    ReportSchedulerJob,
  ],
  exports: [
    AnalyticsService,
    DashboardService,
    ReportService,
  ],
})
export class AnalyticsModule {}
