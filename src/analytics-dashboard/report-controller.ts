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
  Req, 
  HttpStatus, 
  HttpException, 
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from '../services/report.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  async findAll(
    @Query('role') roleId: string,
    @Req() req
  ) {
    return this.reportService.findAll(req.user.id, roleId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const report = await this.reportService.findOne(id);
    
    // Check if the user has access to this report
    if (report.userId !== req.user.id && 
        (!req.user.roles.includes('admin') && report.roleId && !req.user.roles.includes(report.roleId))) {
      throw new HttpException('You do not have access to this report', HttpStatus.FORBIDDEN);
    }
    
    return report;
  }

  @Post()
  @Roles('admin', 'analyst', 'instructor')
  async create(@Body() createReportDto: CreateReportDto, @Req() req) {
    return this.reportService.create(createReportDto, req.user.id);
  }

  @Put(':id')
  @Roles('admin', 'analyst', 'instructor')
  async update(
    @Param('id') id: string,
    @Body() updateReportDto: any,
    @Req() req
  ) {
    const report = await this.reportService.findOne(id);
    
    // Check if the user has permission to update this report
    if (report.userId !== req.user.id && !req.user.roles.includes('admin')) {
      throw new HttpException('You do not have permission to update this report', HttpStatus.FORBIDDEN);
    }
    
    return this.reportService.update(id, updateReportDto);
  }

  @Delete(':id')
  @Roles('admin', 'analyst', 'instructor')
  async remove(@Param('id') id: string, @Req() req) {
    const report = await this.reportService.findOne(id);
    
    // Check if the user has permission to delete this report
    if (report.userId !== req.user.id && !req.user.roles.includes('admin')) {
      throw new HttpException('You do not have permission to delete this report', HttpStatus.FORBIDDEN);
    }
    
    return this.reportService.remove(id);
  }

  @Post(':id/execute')
  @Roles('admin', 'analyst', 'instructor')
  async executeReport(
    @Param('id') id: string,
    @Body() params: any,
    @Req() req
  ) {
    const report = await this.reportService.findOne(id);
    
    // Check if the user has access to this report
    if (report.userId !== req.user.id && 
        (!req.user.roles.includes('admin') && report.roleId && !req.user.roles.includes(report.roleId))) {
      throw new HttpException('You do not have access to this report', HttpStatus.FORBIDDEN);
    }
    
    return this.reportService.executeReport(id, params);
  }

  @Get(':id/download')
  @Roles('admin', 'analyst', 'instructor')
  async downloadReport(
    @Param('id') id: string,
    @Query('format') format: string,
    @Query('executionId') executionId: string,
    @Req() req,
    @Res() res: Response
  ) {
    const report = await this.reportService.findOne(id);
    
    // Check if the user has access to this report
    if (report.userId !== req.user.id && 
        (!req.user.roles.includes('admin') && report.roleId && !req.user.roles.includes(report.roleId))) {
      throw new HttpException('You do not have access to this report', HttpStatus.FORBIDDEN);
    }
    
    const { data, filename, contentType } = await this.reportService.downloadReport(id, format, executionId);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(data);
  }

  @Post(':id/schedule')
  @Roles('admin', 'analyst')
  async scheduleReport(
    @Param('id') id: string,
    @Body() scheduleOptions: { frequency: string; cronExpression?: string; recipients: any[] },
    @Req() req
  ) {
    const report = await this.reportService.findOne(id);
    
    // Check if the user has permission to schedule this report
    if (report.userId !== req.user.id && !req.user.roles.includes('admin')) {
      throw new HttpException('You do not have permission to schedule this report', HttpStatus.FORBIDDEN);
    }
    
    return this.reportService.scheduleReport(id, scheduleOptions);
  }

  @Post(':id/send')
  @Roles('admin', 'analyst')
  async sendReportNow(
    @Param('id') id: string,
    @Body() options: { recipients: any[]; format?: string },
    @Req() req
  ) {
    const report = await this.reportService.findOne(id);
    
    // Check if the user has permission to send this report
    if (report.userId !== req.user.id && !req.user.roles.includes('admin')) {
      throw new HttpException('You do not have permission to send this report', HttpStatus.FORBIDDEN);
    }
    
    return this.reportService.sendReportNow(id, options);
  }

  @Get('executions/history')
  @Roles('admin', 'analyst')
  async getExecutionHistory(
    @Query('reportId') reportId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req
  ) {
    if (reportId) {
      const report = await this.reportService.findOne(reportId);
      
      // Check if the user has access to this report's history
      if (report.userId !== req.user.id && !req.user.roles.includes('admin')) {
        throw new HttpException('You do not have access to this report history', HttpStatus.FORBIDDEN);
      }
    }
    
    return this.reportService.getExecutionHistory(reportId, startDate, endDate, req.user.id);
  }
}
