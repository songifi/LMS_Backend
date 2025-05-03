import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { Submission } from './entities/submission.entity';
import { Rubric } from './entities/rubric.entity';
import { RubricCriterion } from './entities/rubric-criterion.entity';
import { Feedback } from './entities/feedback.entity';
import { GradingHistory } from './entities/grading-history.entity';
import { FeedbackLibrary } from './entities/feedback-library.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { CreateRubricDto } from './dto/create-rubric.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { CreateFeedbackLibraryItemDto } from './dto/create-feedback-library-item.dto';
import { SimilarityService } from './services/similarity.service';
import { FeedbackSuggestionService } from './services/feedback-suggestion.service';
import { AnalyticsService } from './services/analytics.service';

@Injectable()
export class GradingService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentsRepository: Repository<Assignment>,
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,
    @InjectRepository(Rubric)
    private rubricsRepository: Repository<Rubric>,
    @InjectRepository(RubricCriterion)
    private rubricCriteriaRepository: Repository<RubricCriterion>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(GradingHistory)
    private gradingHistoryRepository: Repository<GradingHistory>,
    @InjectRepository(FeedbackLibrary)
    private feedbackLibraryRepository: Repository<FeedbackLibrary>,
    private similarityService: SimilarityService,
    private feedbackSuggestionService: FeedbackSuggestionService,
    private analyticsService: AnalyticsService,
  ) {}

  // Assignment methods
  async createAssignment(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const assignment = this.assignmentsRepository.create(createAssignmentDto);
    return this.assignmentsRepository.save(assignment);
  }

  async findAllAssignments(): Promise<Assignment[]> {
    return this.assignmentsRepository.find({
      relations: ['rubric', 'rubric.criteria'],
    });
  }

  async findAssignmentById(id: string): Promise<Assignment> {
    const assignment = await this.assignmentsRepository.findOne({
      where: { id },
      relations: ['rubric', 'rubric.criteria'],
    });
    
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    
    return assignment;
  }

  // Rubric methods
  async createRubric(createRubricDto: CreateRubricDto): Promise<Rubric> {
    const { criteria, assignmentId, ...rubricData } = createRubricDto;
    
    // Create the rubric
    const rubric = this.rubricsRepository.create(rubricData);
    const savedRubric = await this.rubricsRepository.save(rubric);
    
    // Create criteria
    if (criteria && criteria.length > 0) {
      const rubricCriteria = criteria.map(criterion => ({
        ...criterion,
        rubricId: savedRubric.id,
      }));
      
      const createdCriteria = this.rubricCriteriaRepository.create(rubricCriteria);
      await this.rubricCriteriaRepository.save(createdCriteria);
    }
    
    // Link to assignment if provided
    if (assignmentId) {
      const assignment = await this.assignmentsRepository.findOne({
        where: { id: assignmentId },
      });
      
      if (assignment) {
        assignment.rubricId = savedRubric.id;
        await this.assignmentsRepository.save(assignment);
      }
    }
    
    return this.findRubricById(savedRubric.id);
  }

  async findRubricById(id: string): Promise<Rubric> {
    const rubric = await this.rubricsRepository.findOne({
      where: { id },
      relations: ['criteria'],
    });
    
    if (!rubric) {
      throw new NotFoundException(`Rubric with ID ${id} not found`);
    }
    
    return rubric;
  }

  // Submission methods
  async createSubmission(createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
    const { assignmentId, ...submissionData } = createSubmissionDto;
    
    // Verify assignment exists
    const assignment = await this.assignmentsRepository.findOne({
      where: { id: assignmentId },
    });
    
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }
    
    const submission = this.submissionsRepository.create({
      ...submissionData,
      assignmentId,
      status: 'submitted',
      submittedAt: new Date(),
    });
    
    return this.submissionsRepository.save(submission);
  }

  async findSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
    return this.submissionsRepository.find({
      where: { assignmentId },
      relations: ['feedback'],
    });
  }

  // Grading methods
  async gradeSubmission(submissionId: string, gradeSubmissionDto: GradeSubmissionDto): Promise<Feedback> {
    const { criteriaScores, comments, overallFeedback } = gradeSubmissionDto;
    
    const submission = await this.submissionsRepository.findOne({
      where: { id: submissionId },
      relations: ['assignment', 'assignment.rubric', 'assignment.rubric.criteria'],
    });
    
    if (!submission) {
      throw new NotFoundException(`Submission with ID ${submissionId} not found`);
    }
    
    // Calculate total score
    let totalScore = 0;
    const rubricCriteria = submission.assignment.rubric.criteria;
    
    for (const criterion of rubricCriteria) {
      const score = criteriaScores[criterion.id];
      if (score === undefined) {
        throw new BadRequestException(`Score for criterion ${criterion.id} is missing`);
      }
      
      if (score < 0 || score > criterion.maxScore) {
        throw new BadRequestException(
          `Score for criterion ${criterion.id} must be between 0 and ${criterion.maxScore}`,
        );
      }
      
      totalScore += score;
    }
    
    // Create feedback record
    const feedback = this.feedbackRepository.create({
      submissionId,
      overallFeedback,
      criteriaScores,
      comments,
      totalScore,
      gradedAt: new Date(),
    });
    
    const savedFeedback = await this.feedbackRepository.save(feedback);
    
    // Update submission status
    submission.status = 'graded';
    submission.grade = totalScore;
    await this.submissionsRepository.save(submission);
    
    // Create grading history entry
    const gradingHistory = this.gradingHistoryRepository.create({
      submissionId,
      feedbackId: savedFeedback.id,
      totalScore,
      gradedAt: new Date(),
    });
    
    await this.gradingHistoryRepository.save(gradingHistory);
    
    // Add comments to feedback library if they're substantial
    if (comments) {
      for (const [criterionId, comment] of Object.entries(comments)) {
        if (comment && comment.length > 20) {
          const criterion = rubricCriteria.find(c => c.id === criterionId);
          if (criterion) {
            await this.addToFeedbackLibrary(
              comment,
              criterion.name,
              submission.assignment.courseId,
            );
          }
        }
      }
    }
    
    return savedFeedback;
  }

  // Similarity detection
  async detectSimilarities(assignmentId: string, threshold: number = 70): Promise<any> {
    const submissions = await this.submissionsRepository.find({
      where: { assignmentId },
      select: ['id', 'studentId', 'studentName', 'content'],
    });
    
    return this.similarityService.detectSimilarities(submissions, threshold);
  }

  // Feedback library methods
  async createFeedbackLibraryItem(createFeedbackLibraryItemDto: CreateFeedbackLibraryItemDto): Promise<FeedbackLibrary> {
    const feedbackItem = this.feedbackLibraryRepository.create(createFeedbackLibraryItemDto);
    return this.feedbackLibraryRepository.save(feedbackItem);
  }

  private async addToFeedbackLibrary(content: string, category: string, courseId: string): Promise<void> {
    const existingItem = await this.feedbackLibraryRepository.findOne({
      where: { content, category },
    });
    
    if (existingItem) {
      existingItem.usageCount += 1;
      await this.feedbackLibraryRepository.save(existingItem);
    } else {
      const feedbackItem = this.feedbackLibraryRepository.create({
        content,
        category,
        courseId,
        usageCount: 1,
      });
      await this.feedbackLibraryRepository.save(feedbackItem);
    }
  }

  async getFeedbackLibrary(category?: string): Promise<FeedbackLibrary[]> {
    if (category) {
      return this.feedbackLibraryRepository.find({
        where: { category },
        order: { usageCount: 'DESC' },
      });
    }
    
    return this.feedbackLibraryRepository.find({
      order: { usageCount: 'DESC' },
    });
  }

  // Feedback suggestions
  async getFeedbackSuggestions(submissionId: string): Promise<any> {
    const submission = await this.submissionsRepository.findOne({
      where: { id: submissionId },
      relations: ['assignment', 'assignment.rubric', 'assignment.rubric.criteria'],
    });
    
    if (!submission) {
      throw new NotFoundException(`Submission with ID ${submissionId} not found`);
    }
    
    return this.feedbackSuggestionService.generateSuggestions(submission);
  }

  // Analytics
  async getGradingAnalytics(assignmentId: string): Promise<any> {
    const submissions = await this.submissionsRepository.find({
      where: { assignmentId, status: 'graded' },
      relations: ['feedback'],
    });
    
    return this.analyticsService.generateAnalytics(assignmentId, submissions);
  }
}