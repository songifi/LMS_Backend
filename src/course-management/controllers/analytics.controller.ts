import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CourseAnalyticsDto } from '../dto/course-analytics.dto';
import { AnalyticsService } from '../providers/analytics.service';

@Controller('course-management/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCourseAnalytics(@Query() courseAnalyticsDto: CourseAnalyticsDto) {
    const analytics = await this.analyticsService.getCourseAnalytics(
      courseAnalyticsDto.courseId,
      courseAnalyticsDto.period,
    );

    return {
      success: true,
      data: analytics,
    };
  }
}