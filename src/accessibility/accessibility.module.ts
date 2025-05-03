import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessibilityController } from './accessibility.controller';
import { AccessibilityService } from './accessibility.service';
import { AccessibilityIssue } from './entities/accessibility-issue.entity';
import { AccessibilityAudit } from './entities/accessibility-audit.entity';
import { AccessibilityReport } from './entities/accessibility-report.entity';
import { AccessibilityRemediationTask } from './entities/accessibility-remediation-task.entity';
import { AutomatedTestingService } from './services/automated-testing.service';
import { ManualAuditService } from './services/manual-audit.service';
import { RemediationService } from './services/remediation.service';
import { ReportingService } from './services/reporting.service';
import { AxeTestingProvider } from './providers/axe-testing.provider';
import { PuppeteerProvider } from './providers/puppeteer.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccessibilityIssue,
      AccessibilityAudit,
      AccessibilityReport,
      AccessibilityRemediationTask,
    ]),
  ],
  controllers: [AccessibilityController],
  providers: [
    AccessibilityService,
    AutomatedTestingService,
    ManualAuditService,
    RemediationService,
    ReportingService,
    AxeTestingProvider,
    PuppeteerProvider,
  ],
  exports: [AccessibilityService],
})
export class AccessibilityModule {}