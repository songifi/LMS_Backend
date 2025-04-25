import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from '../entities/grade.entity';
import { Submission } from '../entities/submission.entity';
import { GradingRubric } from '../entities/grading-rubric.entity';
import { CreateGradeDto } from '../dto/create-grade.dto';
import { Question } from '../entities/question.entity';
import { User } from 'src/user/entities/user.entity';
import { SubmissionStatus } from '../enums/submissionStatus.enum';
import { QuestionType } from '../enums/questionType.enum';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>,
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    @InjectRepository(GradingRubric)
    private rubricRepository: Repository<GradingRubric>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async create(createGradeDto: CreateGradeDto, grader: User): Promise<Grade> {
    const submission = await this.submissionRepository.findOne({
      where: { id: createGradeDto.submissionId },
      relations: ['assessment'],
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${createGradeDto.submissionId} not found`);
    }

    let rubric: GradingRubric | null = null;
    if (createGradeDto.rubricId) {
      rubric = await this.rubricRepository.findOne({ where: { id: createGradeDto.rubricId } });
      if (!rubric) {
        throw new NotFoundException(`Rubric with ID ${createGradeDto.rubricId} not found`);
      }
    }

    const gradeData: Partial<Grade> = {
      submission,
      score: createGradeDto.score,
      isAutoGraded: createGradeDto.isAutoGraded || false,
      feedback: createGradeDto.feedback,
      gradedBy: grader,
      rubricScores: createGradeDto.rubricScores,
    };

    if (rubric) {
      gradeData.rubric = rubric;
    }

    const grade = this.gradeRepository.create(gradeData);
    await this.gradeRepository.save(grade);

    submission.status = SubmissionStatus.GRADED;
    await this.submissionRepository.save(submission);

    return grade;
  }

  async findBySubmission(submissionId: string): Promise<Grade | null> {
    return this.gradeRepository.findOne({
      where: { submission: { id: submissionId } },
      relations: ['submission', 'gradedBy', 'rubric'],
    });
  }

  async autoGrade(submission: Submission): Promise<Grade | null> {
    const questions = await this.questionRepository.find({
      where: { assessment: { id: submission.assessment.id } },
    });

    let score = 0;
    let totalPossiblePoints = 0;

    for (const question of questions) {
      totalPossiblePoints += question.points;

      if ([QuestionType.MULTIPLE_CHOICE, QuestionType.TRUE_FALSE, QuestionType.MATCHING].includes(question.type)) {
        const answer = submission.answers[question.id];

        if (this.isAnswerCorrect(question, answer)) {
          score += question.points;
        }
      }
    }

    if (totalPossiblePoints > 0) {
      const grade = this.gradeRepository.create({
        submission,
        score,
        isAutoGraded: true,
        feedback: 'Auto-graded by system',
      });

      await this.gradeRepository.save(grade);

      submission.status = SubmissionStatus.GRADED;
      await this.submissionRepository.save(submission);

      return grade;
    }

    return null;
  }

  private isAnswerCorrect(question: Question, answer: any): boolean {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return JSON.stringify(answer) === JSON.stringify(question.correctAnswer);
      case QuestionType.TRUE_FALSE:
        return answer === question.correctAnswer;
      case QuestionType.MATCHING:
        if (!answer || !question.correctAnswer) return false;
        for (const key in question.correctAnswer) {
          if (answer[key] !== question.correctAnswer[key]) {
            return false;
          }
        }
        return true;
      default:
        return false;
    }
  }
}
