import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { RiskIndicatorController } from './controllers/risk-indicator.controller';
import { InterventionController } from './controllers/intervention.controller';
import { CaseManagementController } from './controllers/case-management.controller';
import { OutcomeTrackingController } from './controllers/outcome-tracking.controller';

import { RiskIndicatorService } from './services/risk-indicator.service';
import { InterventionService } from './services/intervention.service';
import { CaseManagementService } from './services/case-management.service';
import { OutcomeTrackingService } from './services/outcome-tracking.service';
import { PrivacyService } from './services/privacy.service';
import { NotificationService } from './services/notification.service';

import { Student, StudentSchema } from './entities/student.entity';
import { RiskIndicator, RiskIndicatorSchema } from './entities/risk-indicator.entity';
import { RiskProfile, RiskProfileSchema } from './entities/risk-profile.entity';
import { Intervention, InterventionSchema } from './entities/intervention.entity';
import { Case, CaseSchema } from './entities/case.entity';
import { Outcome, OutcomeSchema } from './entities/outcome.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: RiskIndicator.name, schema: RiskIndicatorSchema },
      { name: RiskProfile.name, schema: RiskProfileSchema },
      { name: Intervention.name, schema: InterventionSchema },
      { name: Case.name, schema: CaseSchema },
      { name: Outcome.name, schema: OutcomeSchema },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    RiskIndicatorController,
    InterventionController,
    CaseManagementController,
    OutcomeTrackingController,
  ],
  providers: [
    RiskIndicatorService,
    InterventionService,
    CaseManagementService,
    OutcomeTrackingService,
    PrivacyService,
    NotificationService,
  ],
  exports: [
    RiskIndicatorService,
    InterventionService,
    CaseManagementService,
    OutcomeTrackingService,
    PrivacyService,
  ],
})
export class EarlyWarningModule {}