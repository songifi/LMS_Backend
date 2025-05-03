import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessibilityIssue } from '../entities/accessibility-issue.entity';
import { AccessibilityReport } from '../entities/accessibility-report.entity';
import { GenerateReportDto } from '../dto/generate-report.dto';

@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(AccessibilityIssue)
    private issueRepository: Repository<AccessibilityIssue>,
    @InjectRepository(AccessibilityReport)
    private reportRepository: Repository<AccessibilityReport>,
  ) {}

  async generateReport(generateReportDto: GenerateReportDto) {
    // Get all issues
    const query = this.issueRepository.createQueryBuilder('issue');
    
    // Apply filters if provided
    if (generateReportDto.dateRange) {
      query.andWhere('issue.detectedAt BETWEEN :start AND :end', {
        start: generateReportDto.dateRange.startDate,
        end: generateReportDto.dateRange.endDate,
      });
    }
    
    if (generateReportDto.urls && generateReportDto.urls.length > 0) {
      query.andWhere('issue.url IN (:...urls)', { urls: generateReportDto.urls });
    }
    
    const issues = await query.getMany();
    
    // Calculate summary statistics
    const summary = {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.impactLevel === 'critical').length,
      seriousIssues: issues.filter(i => i.impactLevel === 'serious').length,
      moderateIssues: issues.filter(i => i.impactLevel === 'moderate').length,
      minorIssues: issues.filter(i => i.impactLevel === 'minor').length,
      resolvedIssues: issues.filter(i => i.status === 'resolved').length,
      openIssues: issues.filter(i => i.status === 'open' || i.status === 'in_progress').length,
      wcagConformanceLevel: this.calculateConformanceLevel(issues),
      passedTests: 0, // This would need to be calculated based on test results
      failedTests: issues.length,
    };
    
    // Group issues by WCAG criterion
    const issuesByWcag = issues.reduce((acc, issue) => {
      if (!acc[issue.wcagCriterion]) {
        acc[issue.wcagCriterion] = [];
      }
      acc[issue.wcagCriterion].push(issue);
      return acc;
    }, {});
    
    // Group issues by URL
    const issuesByUrl = issues.reduce((acc, issue) => {
      if (!acc[issue.url]) {
        acc[issue.url] = [];
      }
      acc[issue.url].push(issue);
      return acc;
    }, {});
    
    // Create detailed results
    const detailedResults = {
      issuesByWcag,
      issuesByUrl,
      issuesByImpact: {
        critical: issues.filter(i => i.impactLevel === 'critical'),
        serious: issues.filter(i => i.impactLevel === 'serious'),
        moderate: issues.filter(i => i.impactLevel === 'moderate'),
        minor: issues.filter(i => i.impactLevel === 'minor'),
      },
      issuesByStatus: {
        open: issues.filter(i => i.status === 'open'),
        in_progress: issues.filter(i => i.status === 'in_progress'),
        resolved: issues.filter(i => i.status === 'resolved'),
        wont_fix: issues.filter(i => i.status === 'wont_fix'),
      },
    };
    
    // Create report
    const report = this.reportRepository.create({
      name: generateReportDto.name,
      description: generateReportDto.description,
      format: generateReportDto.format,
      summary,
      detailedResults,
    });
    
    // Save and generate file
    const savedReport = await this.reportRepository.save(report);
    
    // Generate file based on format
    let filePath = null;
    switch (generateReportDto.format) {
      case 'pdf':
        filePath = await this.generatePdfReport(savedReport);
        break;
      case 'html':
        filePath = await this.generateHtmlReport(savedReport);
        break;
      case 'json':
        filePath = await this.generateJsonReport(savedReport);
        break;
    }
    
    // Update report with file path
    savedReport.filePath = filePath;
    return this.reportRepository.save(savedReport);
  }

  private calculateConformanceLevel(issues: AccessibilityIssue[]): string {
    const hasCriticalIssues = issues.some(i => 
      (i.impactLevel === 'critical' || i.impactLevel === 'serious') && 
      (i.status === 'open' || i.status === 'in_progress')
    );
    
    if (hasCriticalIssues) {
      return 'Not conformant';
    }
    
    const hasModerateIssues = issues.some(i => 
      i.impactLevel === 'moderate' && 
      (i.status === 'open' || i.status === 'in_progress')
    );
    
    if (hasModerateIssues) {
      return 'Partially conformant (WCAG A)';
    }
    
    const hasMinorIssues = issues.some(i => 
      i.impactLevel === 'minor' && 
      (i.status === 'open' || i.status === 'in_progress')
    );
    
    if (hasMinorIssues) {
      return 'Mostly conformant (WCAG AA)';
    }
    
    return 'Fully conformant (WCAG AAA)';
  }

  private async generatePdfReport(report: AccessibilityReport): Promise<string> {
    // In a real implementation, you'd use a library like PDFKit or puppeteer to generate PDFs
    const filePath = `reports/${report.id}.pdf`;
    // Generate PDF logic here
    return filePath;
  }

  private async generateHtmlReport(report: AccessibilityReport): Promise<string> {
    const filePath = `reports/${report.id}.html`;
    // Generate HTML logic here
    return filePath;
  }

  private async generateJsonReport(report: AccessibilityReport): Promise<string> {
    const filePath = `reports/${report.id}.json`;
    // Write JSON to file
    // fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    return filePath;
  }
}