// learning-path.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningPathService } from './learning-path.service';
import { LearningPathController } from './learning-path.controller';
import { LearningPath } from './entities/learning-path.entity';
import { PathNode } from './entities/path-node.entity';
import { LearnerProgress } from './entities/learner-progress.entity';
import { ContentRecommendation } from './entities/content-recommendation.entity';
import { CompetencyAssessment } from './entities/competency-assessment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningPath,
      PathNode,
      LearnerProgress,
      ContentRecommendation,
      CompetencyAssessment,
    ]),
  ],
  controllers: [LearningPathController],
  providers: [LearningPathService],
})
export class LearningPathModule {}
