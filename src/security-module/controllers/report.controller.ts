import { Controller, Get, Post, Param, Body, Query, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { SecurityReport, ReportType } from '../entities/security-report.entity';

@Controller('security/reports')
export class ReportController {
  private readonly logger = new Logger(ReportController.name);

  constructor(private readonly reportService: ReportService) {}

  @Get()
  async getAllReports() {
    try {
      return await this.reportService.getAllReports();
    } catch (error) {
      this.logger.error(`Error fetching all reports: ${error.message}`);
      throw new HttpException('Failed to retrieve security reports', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getReportById(@Param('id') id: string) {
    try {
      return await this.reportService.getReportById(id);
    } catch (error) {
      this.logger.error(`Error fetching report ${id}: ${error.message}`);
      throw new HttpException(
        `Security report not found: ${error.message}`,
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Post()
  async createReport(@Body() reportData: Partial<SecurityReport>) {
    try {
      return await this.reportService.createReport(reportData);
    } catch (error) {
      this.logger.error(`Error creating security report: ${error.message}`);
      throw new HttpException(
        `Failed to create security report: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('quarterly')
  async generateQuarterlySummary(
    @Body() data: { quarter: number; year: number }
  ) {
    try {
      return await this.reportService.generateQuarterlySummary(data.quarter, data.year);
    } catch (error) {
      this.logger.error(`Error generating quarterly report for Q${data.quarter} ${data.year}: ${error.message}`);
      throw new HttpException(
        `Failed to generate quarterly report: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('pentest/:pentestId')
  async generatePentestReport(@Param('pentestId') pentestId: string) {
    try {
      return await this.reportService.generatePentestReport(pentestId);
    } catch (error) {
      this.logger.error(`Error generating pentest report for ${pentestId}: ${error.message}`);
      throw new HttpException(
        `Failed to generate pentest report: ${error.message}`,
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}