import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

// Controllers
import { GradebookController } from "./controllers/gradebook.controller"
import { GradeCategoryController } from "./controllers/grade-category.controller"
import { GradeScaleController } from "./controllers/grade-scale.controller"
import { GradeCurveController } from "./controllers/grade-curve.controller"
import { GradebookEntryController } from "./controllers/gradebook-entry.controller"
import { GradeDisputeController } from "./controllers/grade-dispute.controller"

// Services
import { GradebookService } from "./providers/gradebook.service"
import { GradeCategoryService } from "./providers/grade-category.service"
import { GradeScaleService } from "./providers/grade-scale.service"
import { GradeCurveService } from "./providers/grade-curve.service"
import { GradebookEntryService } from "./providers/gradebook-entry.service"
import { GradeDisputeService } from "./providers/grade-dispute.service"
import { GradeHistoryService } from "./providers/grade-history.service"

// Entities
import { Gradebook } from "./entities/gradebook.entity"
import { GradeCategory } from "./entities/grade-category.entity"
import { GradeScale } from "./entities/grade-scale.entity"
import { GradeCurve } from "./entities/grade-curve.entity"
import { GradebookEntry } from "./entities/gradebook-entry.entity"
import { GradeDispute } from "./entities/grade-dispute.entity"
import { GradeHistory } from "./entities/grade-history.entity"

// External entities
import { User } from "src/user/entities/user.entity"
import { Assessment } from "src/assessment/entities/assessment.entity"
import { Grade } from "src/assessment/entities/grade.entity"
import { GradeHistoryController } from "./controllers/grade-history.controller"
import { GradeExportController } from "./controllers/grade-export.controller"
import { GradeExportService } from "./grade-export.service"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Gradebook,
      GradeCategory,
      GradeScale,
      GradeCurve,
      GradebookEntry,
      GradeDispute,
      GradeHistory,
      User,
      Assessment,
      Grade,
    ]),
  ],
  controllers: [
    GradebookController,
    GradeCategoryController,
    GradeScaleController,
    GradeCurveController,
    GradebookEntryController,
    GradeDisputeController,
    GradeHistoryController,
    GradeExportController,
  ],
  providers: [
    GradebookService,
    GradeCategoryService,
    GradeScaleService,
    GradeCurveService,
    GradebookEntryService,
    GradeDisputeService,
    GradeHistoryService,
    GradeExportService,
  ],
  exports: [GradebookService, GradeCategoryService, GradeScaleService, GradeCurveService, GradebookEntryService],
})
export class GradebookModule {}
