import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Assessment } from '../entities/assessment.entity';
import { Question } from '../entities/question.entity';
import { Assignment } from '../entities/assignment.entity';
import { Quiz } from '../entities/quiz.entity';
import { Exam } from '../entities/exam.entity';
import { CreateAssessmentDto } from '../dto/create-assessment.dto';
import { User } from 'src/user/entities/user.entity';
import { AssessmentType } from '../enums/assessmentType.enum';

@Injectable()
export class AssessmentService {
  constructor(
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    private connection: Connection,
  ) {}

  async create(createAssessmentDto: CreateAssessmentDto, creator: User): Promise<Assessment> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const assessment = this.assessmentRepository.create({
        ...createAssessmentDto,
        creator,
      });

      await queryRunner.manager.save(assessment);

      switch (assessment.type) {
        case AssessmentType.ASSIGNMENT:
          const assignment = this.assignmentRepository.create({
            assessment,
            allowFileSubmissions: createAssessmentDto.allowFileSubmissions ?? true,
            allowedFileTypes: createAssessmentDto.allowedFileTypes,
            maxFileSize: createAssessmentDto.maxFileSize,
          });
          await queryRunner.manager.save(assignment);
          break;
        case AssessmentType.QUIZ:
          const quiz = this.quizRepository.create({
            assessment,
            randomizeQuestions: createAssessmentDto.randomizeQuestions ?? false,
            showCorrectAnswers: createAssessmentDto.showCorrectAnswers ?? false,
            showFeedbackImmediately: createAssessmentDto['showFeedbackImmediately'] ?? false,
          });
          await queryRunner.manager.save(quiz);
          break;
        case AssessmentType.EXAM:
        case AssessmentType.TEST:
          const exam = this.examRepository.create({
            assessment,
            requireProctoring: createAssessmentDto.requireProctoring ?? false,
            requireWebcam: createAssessmentDto.requireWebcam ?? false,
          });
          await queryRunner.manager.save(exam);
          break;
      }

      if (createAssessmentDto.questions && createAssessmentDto.questions.length > 0) {
        for (const questionDto of createAssessmentDto.questions) {
          const question = this.questionRepository.create({
            ...questionDto,
            assessment,
          });
          await queryRunner.manager.save(question);
        }
      }

      await queryRunner.commitTransaction();
      return this.findOne(assessment.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(options = {}): Promise<Assessment[]> {
    return this.assessmentRepository.find({ 
      ...options,
      relations: ['questions'],
    });
  }

  async findOne(id: string): Promise<Assessment> {
    const assessment = await this.assessmentRepository.findOne({ 
      where: { id },
      relations: ['questions', 'submissions'],
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }

    let specifics: Record<string, any> = {};

    switch (assessment.type) {
      case AssessmentType.ASSIGNMENT:
        const assignment = await this.assignmentRepository.findOne({ where: { assessment: { id } } });
        if (assignment) specifics = assignment;
        break;
      case AssessmentType.QUIZ:
        const quiz = await this.quizRepository.findOne({ where: { assessment: { id } } });
        if (quiz) specifics = quiz;
        break;
      case AssessmentType.EXAM:
      case AssessmentType.TEST:
        const exam = await this.examRepository.findOne({ where: { assessment: { id } } });
        if (exam) specifics = exam;
        break;
    }

    return { ...assessment, ...specifics };
  }

  async update(id: string, updateAssessmentDto: any): Promise<Assessment> {
    const assessment = await this.findOne(id);

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updatedAssessment = await queryRunner.manager.save(Assessment, {
        ...assessment,
        ...updateAssessmentDto,
      });

      switch (assessment.type) {
        case AssessmentType.ASSIGNMENT:
          await queryRunner.manager.update(Assignment, 
            { assessment: { id } }, 
            {
              allowFileSubmissions: updateAssessmentDto.allowFileSubmissions,
              allowedFileTypes: updateAssessmentDto.allowedFileTypes,
              maxFileSize: updateAssessmentDto.maxFileSize,
            }
          );
          break;
        case AssessmentType.QUIZ:
          await queryRunner.manager.update(Quiz, 
            { assessment: { id } }, 
            {
              randomizeQuestions: updateAssessmentDto.randomizeQuestions,
              showCorrectAnswers: updateAssessmentDto.showCorrectAnswers,
              showFeedbackImmediately: updateAssessmentDto['showFeedbackImmediately'],
            }
          );
          break;
        case AssessmentType.EXAM:
        case AssessmentType.TEST:
          await queryRunner.manager.update(Exam, 
            { assessment: { id } }, 
            {
              requireProctoring: updateAssessmentDto.requireProctoring,
              requireWebcam: updateAssessmentDto.requireWebcam,
            }
          );
          break;
      }

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const assessment = await this.findOne(id);

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(Question, { assessment: { id } });

      switch (assessment.type) {
        case AssessmentType.ASSIGNMENT:
          await queryRunner.manager.delete(Assignment, { assessment: { id } });
          break;
        case AssessmentType.QUIZ:
          await queryRunner.manager.delete(Quiz, { assessment: { id } });
          break;
        case AssessmentType.EXAM:
        case AssessmentType.TEST:
          await queryRunner.manager.delete(Exam, { assessment: { id } });
          break;
      }

      await queryRunner.manager.delete(Assessment, id);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAnalytics(assessmentId: string) {
    const assessment = await this.findOne(assessmentId);

    const submissions = await this.assessmentRepository
      .createQueryBuilder('assessment')
      .innerJoinAndSelect('assessment.submissions', 'submission')
      .leftJoinAndSelect('submission.grade', 'grade')
      .where('assessment.id = :id', { id: assessmentId })
      .getOne();

    const submissionsList = submissions?.submissions || [];

    const grades = submissionsList
      .filter(sub => sub.grade)
      .map(sub => sub.grade.score);

    const analytics = {
      totalSubmissions: submissionsList.length,
      gradedSubmissions: grades.length,
      averageScore: grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0,
      highestScore: grades.length > 0 ? Math.max(...grades) : 0,
      lowestScore: grades.length > 0 ? Math.min(...grades) : 0,
      submissionRate: assessment.submissions ? assessment.submissions.length / assessment.maxAttempts : 0,
    };

    return analytics;
  }
}
