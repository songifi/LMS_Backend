import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { GradingService } from './grading.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { CreateRubricDto } from './dto/create-rubric.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { CreateFeedbackLibraryItemDto } from './dto/create-feedback-library-item.dto';
import { Assignment } from './entities/assignment.entity';
import { Submission } from './entities/submission.entity';
import { Rubric } from './entities/rubric.entity';
import { Feedback } from './entities/feedback.entity';
import { FeedbackLibrary } from './entities/feedback-library.entity';

@ApiTags('grading')
@Controller('grading')
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  // Assignment endpoints
  @Post('assignments')
  @ApiOperation({ summary: 'Create a new assignment' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Assignment created successfully' })
  async createAssignment(@Body() createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    return this.gradingService.createAssignment(createAssignmentDto);
  }

  @Get('assignments')
  @ApiOperation({ summary: 'Get all assignments' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns all assignments' })
  async findAllAssignments(): Promise<Assignment[]> {
    return this.gradingService.findAllAssignments();
  }

  @Get('assignments/:id')
  @ApiOperation({ summary: 'Get assignment by ID' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns the assignment' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Assignment not found' })
  async findAssignmentById(@Param('id') id: string): Promise<Assignment> {
    return this.gradingService.findAssignmentById(id);
  }

  // Rubric endpoints
  @Post('rubrics')
  @ApiOperation({ summary: 'Create a new rubric' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Rubric created successfully' })
  async createRubric(@Body() createRubricDto: CreateRubricDto): Promise<Rubric> {
    return this.gradingService.createRubric(createRubricDto);
  }

  @Get('rubrics/:id')
  @ApiOperation({ summary: 'Get rubric by ID' })
  @ApiParam({ name: 'id', description: 'Rubric ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns the rubric' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Rubric not found' })
  async findRubricById(@Param('id') id: string): Promise<Rubric> {
    return this.gradingService.findRubricById(id);
  }

  // Submission endpoints
  @Post('submissions')
  @ApiOperation({ summary: 'Create a new submission' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Submission created successfully' })
  async createSubmission(@Body() createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
    return this.gradingService.createSubmission(createSubmissionDto);
  }

  @Get('submissions/assignment/:assignmentId')
  @ApiOperation({ summary: 'Get all submissions for an assignment' })
  @ApiParam({ name: 'assignmentId', description: 'Assignment ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns all submissions for the assignment' })
  async findSubmissionsByAssignment(@Param('assignmentId') assignmentId: string): Promise<Submission[]> {
    return this.gradingService.findSubmissionsByAssignment(assignmentId);
  }

  // Grading endpoints
  @Post('grade/:submissionId')
  @ApiOperation({ summary: 'Grade a submission' })
  @ApiParam({ name: 'submissionId', description: 'Submission ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Submission graded successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Submission not found' })
  async gradeSubmission(
    @Param('submissionId') submissionId: string,
    @Body() gradeSubmissionDto: GradeSubmissionDto,
  ): Promise<Feedback> {
    return this.gradingService.gradeSubmission(submissionId, gradeSubmissionDto);
  }

  // Similarity detection
  @Get('similarity/:assignmentId')
  @ApiOperation({ summary: 'Detect similarities across submissions for an assignment' })
  @ApiParam({ name: 'assignmentId', description: 'Assignment ID' })
  @ApiQuery({ name: 'threshold', description: 'Similarity threshold (0-100)', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns similarity report' })
  async detectSimilarities(
    @Param('assignmentId') assignmentId: string,
    @Query('threshold') threshold: number = 70,
  ): Promise<any> {
    return this.gradingService.detectSimilarities(assignmentId, threshold);
  }

  // Feedback library
  @Post('feedback-library')
  @ApiOperation({ summary: 'Add item to feedback library' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Feedback library item created successfully' })
  async createFeedbackLibraryItem(
    @Body() createFeedbackLibraryItemDto: CreateFeedbackLibraryItemDto,
  ): Promise<FeedbackLibrary> {
    return this.gradingService.createFeedbackLibraryItem(createFeedbackLibraryItemDto);
  }

  @Get('feedback-library')
  @ApiOperation({ summary: 'Get feedback library items' })
  @ApiQuery({ name: 'category', description: 'Filter by category', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns feedback library items' })
  async getFeedbackLibrary(@Query('category') category?: string): Promise<FeedbackLibrary[]> {
    return this.gradingService.getFeedbackLibrary(category);
  }

  // Suggestions
  @Get('suggestions/:submissionId')
  @ApiOperation({ summary: 'Get feedback suggestions for a submission' })
  @ApiParam({ name: 'submissionId', description: 'Submission ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns feedback suggestions' })
  async getFeedbackSuggestions(@Param('submissionId') submissionId: string): Promise<any> {
    return this.gradingService.getFeedbackSuggestions(submissionId);
  }

  // Analytics
  @Get('analytics/:assignmentId')
  @ApiOperation({ summary: 'Get grading analytics for an assignment' })
  @ApiParam({ name: 'assignmentId', description: 'Assignment ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns grading analytics' })
  async getGradingAnalytics(@Param('assignmentId') assignmentId: string): Promise<any> {
    return this.gradingService.getGradingAnalytics(assignmentId);
  }
}