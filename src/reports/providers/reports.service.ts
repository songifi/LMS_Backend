import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import * as PdfMake from 'pdfmake/build/pdfmake';
import * as PdfFonts from 'pdfmake/build/vfs_fonts';
import { Parser } from 'json2csv';
import { Report } from '../entities/report.entity';
import { ReportTemplate } from '../entities/report-template.entity';
import { ReportSchedule } from '../entities/report-schedule.entity';
import { ReportParameter } from '../entities/report-parameter.entity';
import { CreateReportDto } from '../dto/create-report.dto';
import { ScheduleReportDto } from '../dto/schedule-report.dto';
import { AnalyticsService } from 'src/course-management/providers/analytics.service';
import { EmailService } from 'src/shared/providers/email.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(ReportTemplate)
    private templateRepository: Repository<ReportTemplate>,
    @InjectRepository(ReportSchedule)
    private scheduleRepository: Repository<ReportSchedule>,
    @InjectRepository(ReportParameter)
    private parameterRepository: Repository<ReportParameter>,
    private analyticsService: AnalyticsService,
    private emailService: EmailService,
  ) {
    (PdfMake as any).vfs = PdfFonts.vfs;
  }

  async findAll(type?: string): Promise<Report[]> {
    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.template', 'template');

    if (type) {
      queryBuilder.where('template.type = :type', { type });
    }

    return queryBuilder.getMany();
  }

  async findById(id: string): Promise<Report> {
    const report = await this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.template', 'template')
      .where('report.id = :id', { id })
      .getOne();

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  async getTemplates(): Promise<ReportTemplate[]> {
    return this.templateRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.parameters', 'parameters')
      .getMany();
  }

  async getSchedules(): Promise<ReportSchedule[]> {
    return this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.template', 'template')
      .getMany();
  }

  async generateReport(createReportDto: CreateReportDto): Promise<Report> {
    const template = await this.templateRepository.findOne({
      where: { id: createReportDto.templateId },
      relations: ['parameters'],
    });

    if (!template) {
      throw new NotFoundException(`Report template with ID ${createReportDto.templateId} not found`);
    }

    this.validateParameters(template, createReportDto.parameters);

    let reportData;
    switch (template.type) {
      case 'dashboard':
      case 'course':
      case 'user':
      case 'custom':
        reportData = await this.generateCourseReport(createReportDto.parameters);
        break;
      default:
        throw new Error(`Unsupported report type: ${template.type}`);
    }

    const report = this.reportRepository.create({
      template,
      parameters: createReportDto.parameters,
      data: reportData,
      userId: createReportDto.parameters.userId || null,
    });

    return this.reportRepository.save(report);
  }

  private validateParameters(template: ReportTemplate, parameters: Record<string, any>): void {
    const requiredParameters = template.parameters.filter(param => param.required);
    for (const param of requiredParameters) {
      if (parameters[param.name] === undefined) {
        throw new Error(`Required parameter ${param.name} is missing`);
      }
    }
  }

  private async generateCourseReport(parameters: Record<string, any>): Promise<any> {
    const { courseId, startDate, endDate } = parameters;

    if (!courseId) {
      throw new Error('courseId parameter is required for course reports');
    }

    // Only this method exists in AnalyticsService
    return this.analyticsService.getCourseAnalytics(courseId);
  }

  async scheduleReport(scheduleDto: ScheduleReportDto): Promise<ReportSchedule> {
    const template = await this.templateRepository.findOne({
      where: { id: scheduleDto.templateId },
    });

    if (!template) {
      throw new NotFoundException(`Report template with ID ${scheduleDto.templateId} not found`);
    }

    const schedule = this.scheduleRepository.create({
      template,
      name: scheduleDto.name,
      parameters: scheduleDto.parameters,
      cronExpression: scheduleDto.cronExpression,
      deliveryConfig: scheduleDto.deliveryConfig,
      userId: scheduleDto.parameters.userId || 'system',
    });

    return this.scheduleRepository.save(schedule);
  }

  async exportReport(reportId: string, format: 'pdf' | 'excel' | 'csv' | 'json', res: Response): Promise<void> {
    const report = await this.findById(reportId);

    switch (format) {
      case 'pdf':
        await this.exportToPdf(report, res);
        break;
      case 'excel':
        await this.exportToExcel(report, res);
        break;
      case 'csv':
        await this.exportToCsv(report, res);
        break;
      case 'json':
        await this.exportToJson(report, res);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async exportToPdf(report: Report, res: Response): Promise<void> {
    const docDefinition = {
      content: [
        { text: report.template.name, style: 'header' },
        { text: report.template.description, style: 'subheader' },
        { text: `Generated: ${new Date(report.generatedAt).toLocaleString()}`, style: 'subheader' },
        { text: '\n\n' },
        { text: JSON.stringify(report.data, null, 2) },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
      },
    };

    const pdfDoc = PdfMake.createPdf(docDefinition);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.template.name}.pdf"`);

    pdfDoc.getBuffer((buffer) => {
      res.end(buffer);
    });
  }

  private async exportToExcel(report: Report, res: Response): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(report.template.name);

    if (Array.isArray(report.data) && report.data.length > 0) {
      const headers = Object.keys(report.data[0]);
      worksheet.addRow(headers);
      report.data.forEach(item => worksheet.addRow(Object.values(item)));
    } else {
      Object.entries(report.data).forEach(([key, value]) => {
        worksheet.addRow([key, JSON.stringify(value)]);
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${report.template.name}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  }

  private async exportToCsv(report: Report, res: Response): Promise<void> {
    let csvData: string;

    if (Array.isArray(report.data) && report.data.length > 0) {
      const fields = Object.keys(report.data[0]);
      const parser = new Parser({ fields });
      csvData = parser.parse(report.data);
    } else {
      const rows = Object.entries(report.data).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : value,
      }));

      const parser = new Parser({ fields: ['key', 'value'] });
      csvData = parser.parse(rows);
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${report.template.name}.csv"`);

    res.send(csvData);
  }

  private async exportToJson(report: Report, res: Response): Promise<void> {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${report.template.name}.json"`);

    const jsonData = {
      reportName: report.template.name,
      reportDescription: report.template.description,
      generatedAt: report.generatedAt,
      parameters: report.parameters,
      data: report.data,
    };

    res.send(JSON.stringify(jsonData, null, 2));
  }

  @Cron(CronExpression.EVERY_HOUR)
  async runScheduledReports(): Promise<void> {
    const now = new Date();
    const schedules = await this.scheduleRepository.find({
      where: { isActive: true },
      relations: ['template'],
    });

    for (const schedule of schedules) {
      if (this.shouldRunSchedule(schedule.cronExpression, now)) {
        try {
          const report = await this.generateReport({
            templateId: schedule.template.id,
            parameters: schedule.parameters,
            name: schedule.name,
          });
          await this.deliverReport(report, schedule.deliveryConfig);
        } catch (error) {
          console.error(`Error running scheduled report ${schedule.id}: ${error.message}`);
        }
      }
    }
  }

  private shouldRunSchedule(cronExpression: string, date: Date): boolean {
    return true; // Placeholder
  }

  private async deliverReport(report: Report, deliveryConfig: any): Promise<void> {
    switch (deliveryConfig.type) {
      case 'email':
        await this.deliverByEmail(report, deliveryConfig);
        break;
      case 'slack':
        await this.deliverBySlack(report, deliveryConfig);
        break;
      case 'webhook':
        await this.deliverByWebhook(report, deliveryConfig);
        break;
      default:
        throw new Error(`Unsupported delivery type: ${deliveryConfig.type}`);
    }
  }

  private async deliverByEmail(report: Report, config: any): Promise<void> {
    const format = config.format || 'pdf';

    await this.emailService.sendEmail({
      to: config.recipients,
      subject: `Scheduled Report: ${report.template.name}`,
      text: `Please find attached the scheduled report "${report.template.name}".`,
      attachments: [
        {
          filename: `${report.template.name}.${format}`,
          content: 'Report content would go here',
        },
      ],
    });
  }

  private async deliverBySlack(report: Report, config: any): Promise<void> {
    console.log(`Delivering report ${report.id} to Slack channels: ${config.recipients.join(', ')}`);
  }

  private async deliverByWebhook(report: Report, config: any): Promise<void> {
    console.log(`Delivering report ${report.id} to webhook: ${config.url}`);
  }
}
