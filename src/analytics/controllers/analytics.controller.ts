import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardMetricsDto } from '../dto/dashboard-metrics.dto';
import { CourseAnalyticsDto } from '../dto/course-analytics.dto';
import { UserAnalyticsDto } from '../dto/user-analytics.dto';
import { AnalyticsService } from '../providers/analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard metrics', description: 'Returns overview metrics for the dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics', type: DashboardMetricsDto })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for metrics (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for metrics (YYYY-MM-DD)' })
  async getDashboardMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<DashboardMetricsDto> {
    return this.analyticsService.getDashboardMetrics(startDate, endDate);
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get courses analytics', description: 'Returns analytics for all courses' })
  @ApiResponse({ status: 200, description: 'Courses analytics', type: [CourseAnalyticsDto] })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for metrics (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for metrics (YYYY-MM-DD)' })
  async getCoursesAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<CourseAnalyticsDto[]> {
    return this.analyticsService.getCoursesAnalytics(startDate, endDate);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get users analytics', description: 'Returns analytics for all users' })
  @ApiResponse({ status: 200, description: 'Users analytics', type: [UserAnalyticsDto] })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for metrics (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for metrics (YYYY-MM-DD)' })
  async getUsersAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<UserAnalyticsDto[]> {
    return this.analyticsService.getUsersAnalytics(startDate, endDate);
  }
}
