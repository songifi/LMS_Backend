import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { AssessmentService } from '../services/assessment.service';
import { CreateAssessmentDto } from '../dtos/create-assessment.dto';
import { UpdateAssessmentDto } from '../dtos/update-assessment.dto';
import { AssessmentFilterDto } from '../dtos/assessment-filter.dto';
import { StartAttemptDto } from '../dtos/start-attempt.dto';
import { SubmitResponseDto } from '../dtos/submit-response.dto';

@Controller('assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post()
  create(@Body() createAssessmentDto: CreateAssessmentDto) {
    return this.assessmentService.create(createAssessmentDto);
  }

  @Get()
  findAll(@Query() filterDto: AssessmentFilterDto) {
    return this.assessmentService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assessmentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssessmentDto: UpdateAssessmentDto) {
    return this.assessmentService.update(id, updateAssessmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assessmentService.remove(id);
  }

  @Post(':id/start')
  startAttempt(@Param('id') id: string, @Body() startAttemptDto: StartAttemptDto) {
    return this.assessmentService.startAttempt(id, startAttemptDto);
  }

  @Post('attempts/:attemptId/submit-response')
  submitResponse(
    @Param('attemptId') attemptId: string,
    @Body() submitResponseDto: SubmitResponseDto,
  ) {
    return this.assessmentService.submitResponse(attemptId, submitResponseDto);
  }

  @Post('attempts/:attemptId/submit')
  submitAttempt(@Param('attemptId') attemptId: string) {
    return this.assessmentService.submitAttempt(attemptId);
  }

  @Get('attempts/:attemptId')
  getAttempt(@Param('attemptId') attemptId: string) {
    return this.assessmentService.getAttempt(attemptId);
  }

  @Get(':id/attempts')
  getAssessmentAttempts(
    @Param('id') id: string,
    @Query('studentId') studentId: string,
  ) {
    return this.assessmentService.getAssessmentAttempts(id, studentId);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.assessmentService.duplicate(id);
  }

  @Post(':id/questions/add')
  addQuestions(
    @Param('id') id: string,
    @Body() body: { questionIds: string[] },
  ) {
    if (!body.questionIds || !Array.isArray(body.questionIds)) {
      throw new BadRequestException('Question IDs must be provided as an array');
    }
    return this.assessmentService.addQuestions(id, body.questionIds);
  }

  @Post(':id/questions/remove')
  removeQuestions(
    @Param('id') id: string,
    @Body() body: { questionIds: string[] },
  ) {
    if (!body.questionIds || !Array.isArray(body.questionIds)) {
      throw new BadRequestException('Question IDs must be provided as an array');
    }
    return this.assessmentService.removeQuestions(id, body.questionIds);
  }

  @Post(':id/questions/reorder')
  reorderQuestions(
    @Param('id') id: string,
    @Body() body: { questionIds: string[] },
  ) {
    if (!body.questionIds || !Array.isArray(body.questionIds)) {
      throw new BadRequestException('Question IDs must be provided as an array');
    }
    return this.assessmentService.reorderQuestions(id, body.questionIds);
  }
}