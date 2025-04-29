import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateSurveyDto } from '../dto/create-survey.dto';
import { UpdateSurveyDto } from '../dto/update-survey.dto';
import { Survey } from '../entities/survey.entity';
import { SurveyService } from '../providers/survey.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('surveys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('surveys')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new survey' })
  @ApiResponse({ status: 201, description: 'The survey has been created', type: Survey })
  create(@Body() createSurveyDto: CreateSurveyDto): Promise<Survey> {
    return this.surveyService.create(createSurveyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all surveys' })
  @ApiResponse({ status: 200, description: 'Return all surveys', type: [Survey] })
  findAll(): Promise<Survey[]> {
    return this.surveyService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active surveys' })
  @ApiResponse({ status: 200, description: 'Return active surveys', type: [Survey] })
  getActiveSurveys(): Promise<Survey[]> {
    return this.surveyService.getActiveSurveys();
  }

  @Get('evaluation-period/:evaluationPeriodId')
  @ApiOperation({ summary: 'Get surveys by evaluation period' })
  @ApiParam({ name: 'evaluationPeriodId', description: 'Evaluation Period ID' })
  @ApiResponse({ status: 200, description: 'Return surveys for evaluation period', type: [Survey] })
  getSurveysByEvaluationPeriod(@Param('evaluationPeriodId') evaluationPeriodId: string): Promise<Survey[]> {
    return this.surveyService.getSurveysByEvaluationPeriod(evaluationPeriodId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific survey' })
  @ApiParam({ name: 'id', description: 'Survey ID' })
  @ApiResponse({ status: 200, description: 'Return the survey', type: Survey })
  findOne(@Param('id') id: string): Promise<Survey> {
    return this.surveyService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a survey' })
  @ApiParam({ name: 'id', description: 'Survey ID' })
  @ApiResponse({ status: 200, description: 'The survey has been updated', type: Survey })
  update(@Param('id') id: string, @Body() updateSurveyDto: UpdateSurveyDto): Promise<Survey> {
    return this.surveyService.update(id, updateSurveyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a survey' })
  @ApiParam({ name: 'id', description: 'Survey ID' })
  @ApiResponse({ status: 200, description: 'The survey has been deleted' })
  remove(@Param('id') id: string): Promise<void> {
    return this.surveyService.remove(id);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: 'Publish a survey' })
  @ApiParam({ name: 'id', description: 'Survey ID' })
  @ApiResponse({ status: 200, description: 'The survey has been published', type: Survey })
  publish(@Param('id') id: string): Promise<Survey> {
    return this.surveyService.publish(id);
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Activate a survey' })
  @ApiParam({ name: 'id', description: 'Survey ID' })
  @ApiResponse({ status: 200, description: 'The survey has been activated', type: Survey })
  activate(@Param('id') id: string): Promise<Survey> {
    return this.surveyService.activate(id);
  }

  @Put(':id/close')
  @ApiOperation({ summary: 'Close a survey' })
  @ApiParam({ name: 'id', description: 'Survey ID' })
  @ApiResponse({ status: 200, description: 'The survey has been closed', type: Survey })
  close(@Param('id') id: string): Promise<Survey> {
    return this.surveyService.close(id);
  }

  @Put(':id/archive')
  @ApiOperation({ summary: 'Archive a survey' })
  @ApiParam({ name: 'id', description: 'Survey ID' })
  @ApiResponse({ status: 200, description: 'The survey has been archived', type: Survey })
  archive(@Param('id') id: string): Promise<Survey> {
    return this.surveyService.archive(id);
  }
}
