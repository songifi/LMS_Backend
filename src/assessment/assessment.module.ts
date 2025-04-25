import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assessment } from './entities/assessment.entity';
import { Question } from './entities/question.entity';
import { QuestionBank } from './entities/question-bank.entity';
import { Submission } from './entities/submission.entity';
import { Grade } from './entities/grade.entity';
import { GradingRubric } from './entities/grading-rubric.entity';
import { Assignment } from './entities/assignment.entity';
import { Quiz } from './entities/quiz.entity';
import { Exam } from './entities/exam.entity';
import { AssessmentController } from './controllers/assessment.controller';
import { SubmissionController } from './controllers/submission.controller';
import { GradeController } from './controllers/grade.controller';
import { QuestionBankController } from './controllers/question-bank.controller';
import { AssessmentService } from './providers/assessment.service';
import { SubmissionService } from './providers/submission.service';
import { GradeService } from './providers/grade.service';
import { QuestionBankService } from './providers/question-bank.service';
import { PlagiarismService } from './providers/plagiarism.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Assessment,
      Question,
      QuestionBank,
      Submission,
      Grade,
      GradingRubric,
      Assignment,
      Quiz,
      Exam,
    ]),
  ],
  controllers: [
    AssessmentController,
    SubmissionController,
    GradeController,
    QuestionBankController,
  ],
  providers: [
    AssessmentService,
    SubmissionService,
    GradeService,
    QuestionBankService,
    PlagiarismService,
  ],
  exports: [
    AssessmentService,
    SubmissionService,
    GradeService,
    QuestionBankService,
  ],
})
export class AssessmentModule {}
