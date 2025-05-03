import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Assessment } from '../entities/assessment.entity';
import { Question } from '../entities/question.entity';
import { Attempt } from '../entities/attempt.entity';
import { CreateAssessmentDto } from '../dtos/create-assessment.dto';
import { UpdateAssessmentDto } from '../dtos/update-assessment.dto';
import { AssessmentFilterDto } from '../dtos/assessment-filter.dto';
import { StartAttemptDto } from '../dtos/start-attempt.dto';
import { SubmitResponseDto } from '../dtos/submit-response.dto';
import { DifficultyService } from './difficulty.service';

@Injectable()
export class AssessmentService {
  constructor(
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Attempt)
    private attemptRepository: Repository<Attempt>,
    private difficultyService: DifficultyService,
  ) {}

  async create(createAssessmentDto: CreateAssessmentDto): Promise<Assessment> {
    const assessment = this.assessmentRepository.create(createAssessmentDto);
    
    // If questionIds are provided, fetch and add the questions
    if (createAssessmentDto.questionIds && createAssessmentDto.questionIds.length > 0) {
      const questions = await this.questionRepository.findBy({
        id: In(createAssessmentDto.questionIds),
      });
      
      assessment.questions = questions;
    }
    
    return this.assessmentRepository.save(assessment);
  }

  async findAll(filterDto: AssessmentFilterDto): Promise<Assessment[]> {
    const query = this.assessmentRepository.createQueryBuilder('assessment')
      .leftJoinAndSelect('assessment.tags', 'tag')
      .leftJoinAndSelect('assessment.categories', 'category');
    
    if (filterDto.search) {
      query.andWhere(
        '(LOWER(assessment.title) LIKE LOWER(:search) OR LOWER(assessment.description) LIKE LOWER(:search))',
        { search: `%${filterDto.search}%` },
      );
    }
    
    if (filterDto.tagIds && filterDto.tagIds.length > 0) {
      query.andWhere('tag.id IN (:...tagIds)', { tagIds: filterDto.tagIds });
    }
    
    if (filterDto.categoryIds && filterDto.categoryIds.length > 0) {
      query.andWhere('category.id IN (:...categoryIds)', { categoryIds: filterDto.categoryIds });
    }
    
    if (filterDto.active !== undefined) {
      query.andWhere('assessment.active = :active', { active: filterDto.active });
    }
    
    if (filterDto.createdAfter) {
      query.andWhere('assessment.createdAt >= :createdAfter', { createdAfter: filterDto.createdAfter });
    }
    
    if (filterDto.createdBefore) {
      query.andWhere('assessment.createdAt <= :createdBefore', { createdBefore: filterDto.createdBefore });
    }
    
    if (filterDto.sortBy) {
      const direction = filterDto.sortDirection === 'DESC' ? 'DESC' : 'ASC';
      query.orderBy(`assessment.${filterDto.sortBy}`, direction);
    } else {
      query.orderBy('assessment.updatedAt', 'DESC');
    }
    
    if (filterDto.limit) {
      query.take(filterDto.limit);
    }
    
    if (filterDto.offset) {
      query.skip(filterDto.offset);
    }
    
    return query.getMany();
  }

  async findOne(id: string): Promise<Assessment> {
    const assessment = await this.assessmentRepository.findOne({
      where: { id },
      relations: ['questions', 'tags', 'categories'],
    });
    
    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }
    
    return assessment;
  }

  async update(id: string, updateAssessmentDto: UpdateAssessmentDto): Promise<Assessment> {
    const assessment = await this.findOne(id);
    
    // Update basic properties
    Object.assign(assessment, updateAssessmentDto);
    
    return this.assessmentRepository.save(assessment);
  }

  async remove(id: string): Promise<void> {
    const result = await this.assessmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }
  }

  async startAttempt(id: string, startAttemptDto: StartAttemptDto): Promise<Attempt> {
    const assessment = await this.findOne(id);
    
    // Check if maximum attempts have been reached
    if (assessment.maxAttempts > 0) {
      const attemptsCount = await this.attemptRepository.count({
        where: {
          assessmentId: id,
          studentId: startAttemptDto.studentId,
          status: 'COMPLETED',
        },
      });
      
      if (attemptsCount >= assessment.maxAttempts) {
        throw new BadRequestException('Maximum number of attempts reached');
      }
    }
    
    // Determine which questions to include in the attempt
    let questions = assessment.questions;
    
    // Handle question selection methods
    if (assessment.questionSelection) {
      if (assessment.questionSelection.method === 'random' && assessment.questionSelection.count) {
        // Randomly select a subset of questions
        questions = this.getRandomQuestions(questions, assessment.questionSelection.count);
      } else if (assessment.questionSelection.method === 'adaptive') {
        // Implement adaptive selection logic here
        // This would likely involve the DifficultyService
        questions = await this.selectAdaptiveQuestions(
          assessment,
          startAttemptDto.studentId,
          assessment.questionSelection.count || questions.length,
        );
      }
    }
    
    // Shuffle questions if needed
    if (assessment.shuffleQuestions) {
      questions = this.shuffleArray([...questions]);
    }
    
    // Create the attempt
    const attempt = this.attemptRepository.create({
      studentId: startAttemptDto.studentId,
      assessmentId: id,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      questionResponses: questions.map(q => ({
        questionId: q.id,
        response: null,
        correct: false,
        timeSpent: 0,
        hintUsed: false,
        skipped: false,
      })),
      totalScore: 0,
      percentageScore: 0,
      passed: false,
      totalTimeSpent: 0,
      attemptNumber: attemptsCount + 1,
    });
    
    const savedAttempt = await this.attemptRepository.save(attempt);
    
    // Return the attempt with the selected questions
    return {
      ...savedAttempt,
      assessment: {
        ...assessment,
        questions,
      },
    };
  }

  async submitResponse(attemptId: string, submitResponseDto: SubmitResponseDto): Promise<Attempt> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
      relations: ['assessment'],
    });
    
    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }
    
    if (attempt.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Cannot submit response for a completed attempt');
    }
    
    // Find the question
    const question = await this.questionRepository.findOne({
      where: { id: submitResponseDto.questionId },
    });
    
    if (!question) {
      throw new NotFoundException(`Question with ID ${submitResponseDto.questionId} not found`);
    }
    
    // Evaluate the response
    const evaluation = this.evaluateResponse(
      question.type,
      question.content,
      submitResponseDto.response,
    );
    
    // Update the attempt's question response
    const responseIndex = attempt.questionResponses.findIndex(
      qr => qr.questionId === submitResponseDto.questionId,
    );
    
    if (responseIndex === -1) {
      throw new BadRequestException('Question is not part of this attempt');
    }
    
    attempt.questionResponses[responseIndex] = {
      ...attempt.questionResponses[responseIndex],
      response: submitResponseDto.response,
      correct: evaluation.correct,
      partialScore: evaluation.partialScore,
      timeSpent: submitResponseDto.timeSpent || 0,
      hintUsed: submitResponseDto.hintUsed || false,
      skipped: submitResponseDto.skipped || false,
    };
    
    // Record this response in the question's difficulty metrics
    await this.difficultyService.recordResponse(
      question.id,
      evaluation.correct,
      submitResponseDto.timeSpent || 0,
      submitResponseDto.hintUsed || false,
      submitResponseDto.skipped || false,
    );
    
    return this.attemptRepository.save(attempt);
  }

  async submitAttempt(attemptId: string): Promise<Attempt> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
      relations: ['assessment'],
    });
    
    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }
    
    if (attempt.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Attempt is already completed');
    }
    
    // Calculate scores
    const { totalScore, percentageScore, passed } = this.calculateScore(
      attempt.questionResponses,
      attempt.assessment.scoringRules,
    );
    
    attempt.totalScore = totalScore;
    attempt.percentageScore = percentageScore;
    attempt.passed = passed;
    attempt.status = 'COMPLETED';
    attempt.completedAt = new Date();
    attempt.totalTimeSpent = Math.floor(
      (attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000,
    );
    
    // Save and recalibrate difficulty if needed
    const savedAttempt = await this.attemptRepository.save(attempt);
    
    // Trigger difficulty recalibration for all questions in this attempt
    for (const questionResponse of attempt.questionResponses) {
      await this.difficultyService.recalibrateIfNeeded(questionResponse.questionId);
    }
    
    return savedAttempt;
  }

  async getAttempt(attemptId: string): Promise<Attempt> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
      relations: ['assessment', 'assessment.questions'],
    });
    
    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }
    
    return attempt;
  }

  async getAssessmentAttempts(assessmentId: string, studentId?: string): Promise<Attempt[]> {
    const whereClause: any = { assessmentId };
    
    if (studentId) {
      whereClause.studentId = studentId;
    }
    
    return this.attemptRepository.find({
      where: whereClause,
      order: { createdAt: 'DESC' },
    });
  }

  async duplicate(id: string): Promise<Assessment> {
    const original = await this.findOne(id);
    
    const duplicate = this.assessmentRepository.create({
      ...original,
      id: undefined, // Let the database generate a new ID
      title: `Copy of ${original.title}`,
      createdAt: undefined,
      updatedAt: undefined,
    });
    
    // Clone questions, tags and categories
    duplicate.questions = [...original.questions];
    duplicate.tags = [...original.tags];
    duplicate.categories = [...original.categories];
    
    return this.assessmentRepository.save(duplicate);
  }

  async addQuestions(assessmentId: string, questionIds: string[]): Promise<Assessment> {
    const assessment = await this.findOne(assessmentId);
    const questionsToAdd = await this.questionRepository.findBy({
      id: In(questionIds),
    });
    
    if (questionsToAdd.length === 0) {
      throw new NotFoundException('No questions found with the provided IDs');
    }
    
    // Add only questions that aren't already in the assessment
    const existingQuestionIds = assessment.questions.map(q => q.id);
    const newQuestions = questionsToAdd.filter(q => !existingQuestionIds.includes(q.id));
    
    assessment.questions = [...assessment.questions, ...newQuestions];
    
    return this.assessmentRepository.save(assessment);
  }

  async removeQuestions(assessmentId: string, questionIds: string[]): Promise<Assessment> {
    const assessment = await this.findOne(assessmentId);
    
    assessment.questions = assessment.questions.filter(q => !questionIds.includes(q.id));
    
    return this.assessmentRepository.save(assessment);
  }

  async reorderQuestions(assessmentId: string, questionIds: string[]): Promise<Assessment> {
    const assessment = await this.findOne(assessmentId);
    
    // Validate that all IDs in the new order exist in the assessment
    const existingIds = new Set(assessment.questions.map(q => q.id));
    const allIdsExist = questionIds.every(id => existingIds.has(id));
    
    if (!allIdsExist || questionIds.length !== assessment.questions.length) {
      throw new BadRequestException(
        'The provided question IDs do not match the questions in the assessment',
      );
    }
    
    // Create a map of questions by ID for easy lookup
    const questionsMap = assessment.questions.reduce((map, question) => {
      map[question.id] = question;
      return map;
    }, {});
    
    // Reorder the questions
    assessment.questions = questionIds.map(id => questionsMap[id]);
    
    return this.assessmentRepository.save(assessment);
  }

  // Helper methods

  private getRandomQuestions(questions: Question[], count: number): Question[] {
    const shuffled = this.shuffleArray([...questions]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  private async selectAdaptiveQuestions(
    assessment: Assessment,
    studentId: string,
    count: number,
  ): Promise<Question[]> {
    // This would implement adaptive question selection based on student ability
    // and question difficulty
    // For now, just return random questions as a placeholder
    return this.getRandomQuestions(assessment.questions, count);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private evaluateResponse(
    questionType: string,
    questionContent: any,
    response: any,
  ): { correct: boolean; partialScore?: number } {
    // This would implement response evaluation logic for each question type
    // For now, return a simple placeholder evaluation
    
    // Simplified evaluation example
    switch (questionType) {
      case 'MULTIPLE_CHOICE':
        const correctOptionId = questionContent.options.find(o => o.isCorrect)?.id;
        return { correct: response === correctOptionId };
        
      case 'MULTIPLE_ANSWER':
        const correctOptionIds = questionContent.options
          .filter(o => o.isCorrect)
          .map(o => o.id);
        
        const selectedCorrect = response.filter(id => correctOptionIds.includes(id)).length;
        const totalCorrect = correctOptionIds.length;
        
        // Full credit if all correct options are selected and no incorrect ones
        const correct = selectedCorrect === totalCorrect && response.length === totalCorrect;
        
        // Partial credit based on proportion of correct selections
        const partialScore = selectedCorrect / totalCorrect;
        
        return { correct, partialScore };
        
      // Add cases for other question types
        
      default:
        // For complex question types that require human grading
        return { correct: false, partialScore: 0 };
    }
  }

  private calculateScore(
    questionResponses: any[],
    scoringRules: any,
  ): { totalScore: number; percentageScore: number; passed: boolean } {
    // This would implement score calculation based on the scoring rules
    // For now, use a simple calculation

    const totalQuestions = questionResponses.length;
    let correctCount = 0;
    let totalScore = 0;
    
    for (const response of questionResponses) {
      if (response.correct) {
        correctCount++;
        totalScore += 1;
      } else if (response.partialScore) {
        totalScore += response.partialScore;
      }
    }
    
    const percentageScore = (totalScore / totalQuestions) * 100;
    const passingScore = scoringRules?.passingScore || 60;
    const passed = percentageScore >= passingScore;
    
    return { totalScore, percentageScore, passed };
  }
}