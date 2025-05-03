import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { AssessmentAnalyticsRequest } from '../interfaces/analytics.interface';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('questions/effectiveness')
  getQuestionEffectiveness(@Query() filters: any) {
    return this.analyticsService.getQuestionEffectiveness(filters);
  }

  @Get('questions/:id/effectiveness')
  getQuestionEffectivenessById(@Param('id') id: string) {
    return this.analyticsService.getQuestionEffectivenessById(id);
  }

  @Get('questions/performance-over-time')
  getQuestionPerformanceOverTime(@Query() filters: any) {
    return this.analyticsService.getQuestionPerformanceOverTime(filters);
  }

  @Get('assessments/:id/summary')
  getAssessmentSummary(@Param('id') id: string) {
    return this.analyticsService.getAssessmentSummary(id);
  }

  @Get('assessments/:id/question-performance')
  getAssessmentQuestionPerformance(@Param('id') id: string) {
    return this.analyticsService.getAssessmentQuestionPerformance(id);
  }

  @Get('assessments/:id/student-performance')
  getAssessmentStudentPerformance(
    @Param('id') id: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.analyticsService.getAssessmentStudentPerformance(id, studentId);
  }

  @Post('custom')
  getCustomAnalytics(@Body() request: AssessmentAnalyticsRequest) {
    return this.analyticsService.getCustomAnalytics(request);
  }

  @Get('categories/:id/performance')
  getCategoryPerformance(@Param('id') id: string) {
    return this.analyticsService.getCategoryPerformance(id);
  }

  @Get('tags/:id/performance')
  getTagPerformance(@Param('id') id: string) {
    return this.analyticsService.getTagPerformance(id);
  }

  @Get('difficulty/distribution')
  getDifficultyDistribution(@Query() filters: any) {
    return this.analyticsService.getDifficultyDistribution(filters);
  }

  @Get('question-types/performance')
  getQuestionTypePerformance() {
    return this.analyticsService.getQuestionTypePerformance();
  }

  @Get('dashboard')
  getDashboardMetrics() {
    return this.analyticsService.getDashboardMetrics();
  }
}