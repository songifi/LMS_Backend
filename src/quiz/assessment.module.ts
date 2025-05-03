import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Question } from './entities/question.entity';
import { Assessment } from './entities/assessment.entity';
import { Attempt } from './entities/attempt.entity';
import { QuestionVersion } from './entities/question-version.entity';
import { Tag } from './entities/tag.entity';
import { Category } from './entities/category.entity';

// Controllers
import { QuestionController } from './controllers/question.controller';
import { AssessmentController } from './controllers/assessment.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { ImportExportController } from './controllers/import-export.controller';

// Services
import { QuestionService } from './services/question.service';
import { AssessmentService } from './services/assessment.service';
import { DifficultyService } from './services/difficulty.service';
import { AnalyticsService } from './services/analytics.service';
import { ImportExportService } from './services/import-export.service';
import { VersionControlService } from './services/version-control.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question, 
      Assessment, 
      Attempt, 
      QuestionVersion,
      Tag,
      Category
    ]),
  ],
  controllers: [
    QuestionController,
    AssessmentController,
    AnalyticsController,
    ImportExportController,
  ],
  providers: [
    QuestionService,
    AssessmentService,
    DifficultyService,
    AnalyticsService,
    ImportExportService,
    VersionControlService,
  ],
  exports: [
    QuestionService,
    AssessmentService,
    AnalyticsService,
    ImportExportService,
  ],
})
export class AssessmentModule {}