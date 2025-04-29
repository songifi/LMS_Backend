import { Body, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { SurveyResult } from '../entities/survey-result.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SurveyResultService } from '../providers/survey-result.service';

@ApiTags('survey-results')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('survey-results')
export class SurveyResultController {
  constructor(private readonly surveyResultService: SurveyResultService) {}

  @Get('survey/:surveyId')
  @ApiOperation({ summary: 'Get results for a survey' })
  @ApiParam({ name: 'surveyId', description: 'Survey ID' })
  @ApiResponse({ status: 200, description: 'Return the survey results', type: SurveyResult })
  getSurveyResults(@Param('surveyId') surveyId: string): Promise<SurveyResult> {
    return this.surveyResultService.getSurveyResults(surveyId);
  }

  @Get('generate/:surveyId')
  @ApiOperation({ summary: 'Generate new results for a survey' })
  @ApiParam({ name: 'surveyId', description: 'Survey ID' })
  @ApiResponse({ status: 200, description: 'Return the generated survey results', type: SurveyResult })
  generateResults(@Param('surveyId') surveyId: string): Promise<SurveyResult> {
    return this.surveyResultService.generateResults(surveyId);
  }

  @Get('compare')
  @ApiOperation({ summary: 'Compare results from multiple surveys' })
  @ApiResponse({ status: 200, description: 'Return the comparison results' })
  compareResults(@Body() body: { surveyIds: string[] }): Promise<Record<string, any>> {
    return this.surveyResultService.compareResults(body.surveyIds);
  }
}