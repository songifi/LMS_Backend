import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurriculumMappingController } from './curriculum-mapping.controller';
import { CurriculumMappingService } from './curriculum-mapping.service';
import { LearningOutcome } from './entities/learning-outcome.entity';
import { Course } from './entities/course.entity';
import { Assessment } from './entities/assessment.entity';
import { Mapping } from './entities/mapping.entity';
import { Program } from './entities/program.entity';
import { VisualMappingService } from './services/visual-mapping.service';
import { GapAnalysisService } from './services/gap-analysis.service';
import { AssessmentAlignmentService } from './services/assessment-alignment.service';
import { OutcomeTrackingService } from './services/outcome-tracking.service';
import { AccreditationReportService } from './services/accreditation-report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningOutcome,
      Course,
      Assessment,
      Mapping,
      Program
    ]),
  ],
  controllers: [CurriculumMappingController],
  providers: [
    CurriculumMappingService,
    VisualMappingService,
    GapAnalysisService,
    AssessmentAlignmentService,
    OutcomeTrackingService,
    AccreditationReportService
  ],
  exports: [CurriculumMappingService],
})
export class CurriculumMappingModule {}