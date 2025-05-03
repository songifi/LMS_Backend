import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradingController } from './grading.controller';
import { GradingService } from './grading.service';
import { SimilarityService } from './services/similarity.service';
import { FeedbackSuggestionService } from './services/feedback-suggestion.service';
import { AnalyticsService } from './services/analytics.service';
import { Assignment } from './entities/assignment.entity';
import { Submission } from './entities/submission.entity';
import { Rubric } from './entities/rubric.entity';
import { RubricCriterion } from './entities/rubric-criterion.entity';
import { Feedback } from './entities/feedback.entity';
import { GradingHistory } from './entities/grading-history.entity';
import { FeedbackLibrary } from './entities/feedback-library.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Assignment,
      Submission,
      Rubric,
      RubricCriterion,
      Feedback,
      GradingHistory,
      FeedbackLibrary,
    ]),
  ],
  controllers: [GradingController],
  providers: [
    GradingService,
    SimilarityService,
    FeedbackSuggestionService,
    AnalyticsService,
  ],
  exports: [GradingService],
})
export class GradingModule {}