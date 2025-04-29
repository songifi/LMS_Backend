import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateReportDto } from '../dto/create-report.dto';
import { ScheduleReportDto } from '../dto/schedule-report.dto';
import { Report } from '../entities/report.entity';
import { ReportTemplate } from '../entities/report-template.entity';
import { ReportSchedule } from '../entities/report-schedule.entity';
import { ReportsService } from '../providers/reports.service';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reports', description: 'Returns a list of all available reports' })
  @ApiResponse({ status: 200, description: 'List of reports', type: [Report] })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by report type' })
  async getAllReports(@Query('type') type?: string): Promise<Report[]> {
    return this.reportsService.findAll(type);
  }

  @Post()
  @ApiOperation({ summary: 'Generate a report', description: 'Generates a new report based on a template' })
  @ApiBody({ type: CreateReportDto })
  @ApiResponse({ status: 201, description: 'Report generated', type: Report })
  async generateReport(@Body() createReportDto: CreateReportDto): Promise<Report> {
    return this.reportsService.generateReport(createReportDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID', description: 'Returns a specific report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report details', type: Report })
  async getReport(@Param('id') id: string): Promise<Report> {
    return this.reportsService.findById(id);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get report templates', description: 'Returns all available report templates' })
  @ApiResponse({ status: 200, description: 'List of report templates', type: [ReportTemplate] })
  async getReportTemplates(): Promise<ReportTemplate[]> {
    return this.reportsService.getTemplates();
  }

  @Post('schedule')
  @ApiOperation({ summary: 'Schedule a report', description: 'Schedules a report for periodic generation' })
  @ApiBody({ type: ScheduleReportDto })
  @ApiResponse({ status: 201, description: 'Report scheduled', type: ReportSchedule })
  async scheduleReport(@Body() scheduleReportDto: ScheduleReportDto): Promise<ReportSchedule> {
    return this.reportsService.scheduleReport(scheduleReportDto);
  }

  @Get('exports/:id')
  @ApiOperation({ summary: 'Export report', description: 'Exports a report in the specified format' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiQuery({ name: 'format', enum: ['pdf', 'excel', 'csv', 'json'], description: 'Export format' })
  @ApiResponse({ status: 200, description: 'Report exported' })
  async exportReport(
    @Param('id') id: string,
    @Query('format') format: 'pdf' | 'excel' | 'csv' | 'json',
    @Res() res: Response,
  ): Promise<void> {
    return this.reportsService.exportReport(id, format, res);
  }

  @Get('schedules')
  @ApiOperation({ summary: 'Get scheduled reports', description: 'Returns all scheduled reports' })
  @ApiResponse({ status: 200, description: 'List of scheduled reports', type: [ReportSchedule] })
  async getScheduledReports(): Promise<ReportSchedule[]> {
    return this.reportsService.getSchedules();
  }
}