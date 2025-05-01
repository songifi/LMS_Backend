import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseTemplate } from './entities/course-template.entity';
import { TemplateVersion } from './entities/template-version.entity';
import { ContentBlock } from './entities/content-block.entity';
import { LearningOutcome } from './entities/learning-outcome.entity';
import { AssessmentStructure } from './entities/assessment-structure.entity';
import { TemplateVersionController } from './controllers/template-version.controller';
import { ContentBlockController } from './controllers/content-block.controller';
import { LearningOutcomeController } from './controllers/learning-outcome.controller';
import { AssessmentStructureController } from './controllers/assessment-structure.controller';
import { CourseTemplateController } from './controllers/course-templates.controller';
import { CourseTemplateService } from './providers/course-templates.service';
import { TemplateVersionService } from './providers/template-version.service';
import { ContentBlockService } from './providers/content-block.service';
import { LearningOutcomeService } from './providers/learning-outcome.service';
import { AssessmentStructureService } from './providers/assessment-structure.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseTemplate,
      TemplateVersion,
      ContentBlock,
      LearningOutcome,
      AssessmentStructure,
    ]),
  ],
  controllers: [
    CourseTemplateController,
    TemplateVersionController,
    ContentBlockController,
    LearningOutcomeController,
    AssessmentStructureController,
  ],
  providers: [
    CourseTemplateService,
    TemplateVersionService,
    ContentBlockService,
    LearningOutcomeService,
    AssessmentStructureService,
  ],
  exports: [
    CourseTemplateService,
    TemplateVersionService,
    ContentBlockService,
    LearningOutcomeService,
    AssessmentStructureService,
  ],
})
export class CourseTemplatesModule {}