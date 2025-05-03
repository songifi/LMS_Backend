import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Req, 
  HttpStatus, 
  HttpException 
} from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('metrics')
  @Roles('admin', 'analyst', 'instructor')
  async getAvailableMetrics(@Req() req) {
    return this.analyticsService.getAvailableMetrics(req.user);
  }

  @Get('data-sources')
  @Roles('admin', 'analyst')
  async getDataSources() {
    return this.analyticsService.getDataSources();
  }

  @Get('query')
  @Roles('admin', 'analyst', 'instructor')
  async runQuery(
    @Query('source') dataSourceId: string,
    @Query('query') queryString: string,
    @Req() req
  ) {
    try {
      return await this.analyticsService.runQuery(dataSourceId, queryString, req.user);
    } catch (error) {
      throw new HttpException(
        `Error executing query: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('query')
  @Roles('admin', 'analyst', 'instructor')
  async runComplexQuery(
    @Body() queryData: { dataSourceId: string; query: any; params?: any },
    @Req() req
  ) {
    try {
      return await this.analyticsService.runComplexQuery(
        queryData.dataSourceId,
        queryData.query,
        queryData.params || {},
        req.user
      );
    } catch (error) {
      throw new HttpException(
        `Error executing query: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('trends/:metricId')
  @Roles('admin', 'analyst', 'instructor')
  async getMetricTrend(
    @Param('metricId') metricId: string,
    @Query('start') startDate: string,
    @Query('end') endDate: string,
    @Query('interval') interval: string,
    @Req() req
  ) {
    try {
      return await this.analyticsService.getMetricTrend(
        metricId,
        startDate,
        endDate,
        interval,
        req.user
      );
    } catch (error) {
      throw new HttpException(
        `Error fetching trend data: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('export')
  @Roles('admin', 'analyst', 'instructor')
  async exportData(
    @Query('