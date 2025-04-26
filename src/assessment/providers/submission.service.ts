import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from '../entities/submission.entity';
import { Assessment } from '../entities/assessment.entity';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { PlagiarismService } from './plagiarism.service';
import { GradeService } from './grade.service';
import { User } from 'src/user/entities/user.entity';
import { SubmissionStatus } from '../enums/submissionStatus.enum';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
    private plagiarismService: PlagiarismService,
    private gradeService: GradeService,
  ) {}

  async create(createSubmissionDto: CreateSubmissionDto, student: User, metadata: any): Promise<Submission> {
    const assessment = await this.assessmentRepository.findOne({ 
      where: { id: createSubmissionDto.assessmentId },
      relations: ['questions'],
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${createSubmissionDto.assessmentId} not found`);
    }

    // Check if submission is within time window
    const now = new Date();
    if (assessment.startDate && now < assessment.startDate) {
      throw new BadRequestException('Assessment not yet open for submission');
    }

    // Check if user has remaining attempts
    const attemptCount = await this.submissionRepository.count({
      where: {
        assessment: { id: assessment.id },
        student: { id: student.id },
      },
    });

    if (attemptCount >= assessment.maxAttempts) {
      throw new BadRequestException('Maximum submission attempts reached');
    }

    // Determine if submission is late
    let status = SubmissionStatus.SUBMITTED;
    if (assessment.endDate && now > assessment.endDate) {
      if (!assessment.allowLateSubmissions) {
        throw new BadRequestException('Submission deadline has passed');
      }
      status = SubmissionStatus.LATE;
    }

    // Create submission
    const submission = this.submissionRepository.create({
      assessment,
      student,
      answers: createSubmissionDto.answers,
      fileUrl: createSubmissionDto.fileUrl,
      status,
      attemptNumber: attemptCount + 1,
      ipAddress: metadata.ipAddress,
      browser: metadata.userAgent,
    });

    await this.submissionRepository.save(submission);

    // Check for plagiarism if enabled
    if (assessment.enablePlagiarismCheck) {
      const plagiarismScore = await this.plagiarismService.checkPlagiarism(submission);
      submission.plagiarismScore = plagiarismScore;
      await this.submissionRepository.save(submission);
    }

    // Auto-grade objective questions if applicable
    if (['QUIZ', 'TEST'].includes(assessment.type)) {
      await this.gradeService.autoGrade(submission);
    }

    return submission;
  }

  async findByAssessment(assessmentId: string): Promise<Submission[]> {
    return this.submissionRepository.find({
      where: { assessment: { id: assessmentId } },
      relations: ['student', 'grade'],
    });
  }

  async findOne(id: string): Promise<Submission> {
    const submission = await this.submissionRepository.findOne({
      where: { id },
      relations: ['assessment', 'student', 'grade'],
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }

    return submission;
  }
}
