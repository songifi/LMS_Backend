import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityReport, ReportType } from '../entities/security-report.entity';
import { SecurityIssue, IssueStatus, IssueSeverity } from '../entities/security-issue.entity';
import { PentestSchedule } from '../entities/pentest-schedule.entity';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    @InjectRepository(SecurityReport)
    private reportRepository: Repository<SecurityReport>,
    @InjectRepository(SecurityIssue)
    private securityIssueRepository: Repository<SecurityIssue>,
    @InjectRepository(PentestSchedule)
    private pentestRepository: Repository<PentestSchedule>,
  ) {}

  async createReport(reportData: Partial<SecurityReport>): Promise<SecurityReport> {
    try {
      const report = this.reportRepository.create(reportData);
      return await this.reportRepository.save(report);
    } catch (error) {
      this.logger.error(`Error creating security report: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAllReports(): Promise<SecurityReport[]> {
    return this.reportRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getReportById(id: string): Promise<SecurityReport> {
    const report = await this.reportRepository.findOne({ 
      where: { id },
      relations: ['securityIssue'],
    });
    
    if (!report) {
      throw new Error(`Security report with ID ${id} not found`);
    }
    
    return report;
  }

  async generateQuarterlySummary(quarter: number, year: number): Promise<SecurityReport> {
    try {
      // Calculate date range for the quarter
      const startDate = new Date(year, (quarter - 1) * 3, 1);
      const endDate = new Date(year, quarter * 3, 0);
      
      // Get issues created in this quarter
      const issues = await this.securityIssueRepository.createQueryBuilder('issue')
        .where('issue.createdAt >= :startDate', { startDate })
        .andWhere('issue.createdAt <= :endDate', { endDate })
        .getMany();
      
      // Get pentests in this quarter
      const pentests = await this.pentestRepository.createQueryBuilder('pentest')
        .where('pentest.scheduledStartDate >= :startDate', { startDate })
        .andWhere('pentest.scheduledStartDate <= :endDate', { endDate })
        .getMany();
      
      // Generate report content
      const summaryData = {
        period: `Q${quarter} ${year}`,
        dateRange: {
          start: startDate.toISOString().slice(0, 10),
          end: endDate.toISOString().slice(0, 10),
        },
        issueSummary: {
          total: issues.length,
          bySeverity: {
            critical: issues.filter(i => i.severity === IssueSeverity.CRITICAL).length,
            high: issues.filter(i => i.severity === IssueSeverity.HIGH).length,
            medium: issues.filter(i => i.severity === IssueSeverity.MEDIUM).length,
            low: issues.filter(i => i.severity === IssueSeverity.LOW).length,
            info: issues.filter(i => i.severity === IssueSeverity.INFO).length,
          },
          byStatus: {
            open: issues.filter(i => i.status === IssueStatus.OPEN).length,
            inProgress: issues.filter(i => i.status === IssueStatus.IN_PROGRESS).length,
            resolved: issues.filter(i => i.status === IssueStatus.RESOLVED).length,
            wontFix: issues.filter(i => i.status === IssueStatus.WONT_FIX).length,
            falsePositive: issues.filter(i => i.status === IssueStatus.FALSE_POSITIVE).length,
          },
          bySource: {
            scan: issues.filter(i => i.source === IssueSource.SCAN).length,
            pentest: issues.filter(i => i.source === IssueSource.PENTEST).length,
            disclosure: issues.filter(i => i.source === IssueSource.DISCLOSURE).length,
            internal: issues.filter(i => i.source === IssueSource.INTERNAL).length,
          },
        },
        pentestSummary: {
          total: pentests.length,
          completed: pentests.filter(p => p.status === 'completed').length,
          inProgress: pentests.filter(p => p.status === 'in_progress').length,
        },
        criticalIssues: issues
          .filter(i => i.severity === IssueSeverity.CRITICAL || i.severity === IssueSeverity.HIGH)
          .map(i => ({
            id: i.id,
            title: i.title,
            severity: i.severity,
            status: i.status,
            source: i.source,
          })),
      };
      
      // Create the report
      return await this.createReport({
        title: `Security Quarterly Summary - Q${quarter} ${year}`,
        type: ReportType.QUARTERLY,
        content: JSON.stringify(summaryData, null, 2),
        generatedBy: 'system',
        tags: ['quarterly', `Q${quarter}`, `${year}`],
      });
    } catch (error) {
      this.logger.error(`Error generating quarterly report: ${error.message}`, error.stack);
      throw error;
    }
  }

  async generatePentestReport(pentestId: string): Promise<SecurityReport> {
    try {
      const pentest = await this.pentestRepository.findOne({ where: { id: pentestId } });
      
      if (!pentest) {
        throw new Error(`Pentest with ID ${pentestId} not found`);
      }
      
      // Get issues related to this pentest
      const issues = await this.securityIssueRepository.find({
        where: { source: IssueSource.PENTEST },
        order: { severity: 'ASC' },
      });
      
      // Generate report content
      const reportData = {
        pentestInfo: {
          id: pentest.id,
          title: pentest.title,
          type: pentest.type,
          period: {
            start: pentest.actualStartDate || pentest.scheduledStartDate,
            end: pentest.actualEndDate || pentest.scheduledEndDate,
          },
          pentester: pentest.pentesterName,
        },
        summary: {
          total: issues.length,
          bySeverity: {
            critical: issues.filter(i => i.severity === IssueSeverity.CRITICAL).length,
            high: issues.filter(i => i.severity === IssueSeverity.HIGH).length,
            medium: issues.filter(i => i.severity === IssueSeverity.MEDIUM).length,
            low: issues.filter(i => i.severity === IssueSeverity.LOW).length,
          },
        },
        findings: issues.map(i => ({
          id: i.id,
          title: i.title,
          description: i.description,
          severity: i.severity,
          status: i.status,
          remediationSteps: i.remediationSteps,
        })),
        methodology: this.getPentestMethodology(pentest.type),
      };
      
      // Create the report
      return await this.createReport({
        title: `Penetration Test Report - ${pentest.title}`,
        type: ReportType.PENTEST,
        content: JSON.stringify(reportData, null, 2),
        pentestId: pentestId,
        generatedBy: pentest.pentesterssueSource } from '../entities/security-issue.entity';
import { SecurityReport, ReportType } from '../entities/security-report.entity';
import { NotificationService } from './notification.service';

// Import scanner libraries as needed
// import * as dependencyCheck from 'dependency-check';
// import * as sonarqube from 'sonarqube-scanner';
// import * as zap from 'zaproxy';

@Injectable()
export class ScannerService {
  private readonly logger = new Logger(ScannerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
    @InjectRepository(SecurityIssue)
    private securityIssueRepository: Repository<SecurityIssue>,
    @InjectRepository(SecurityReport)
    private securityReportRepository: Repository<SecurityReport>,
  ) {}

  async runDependencyScan(): Promise<void> {
    try {
      this.logger.log('Starting dependency vulnerability scan');
      
      // Here you would integrate with a tool like npm audit, OWASP Dependency Check, or Snyk
      // Example implementation:
      // const results = await dependencyCheck.scan({
      //   project: this.configService.get('PROJECT_NAME'),
      //   path: this.configService.get('PROJECT_PATH'),
      // });
      
      // Mock scan results for example
      const mockResults = {
        vulnerabilities: [
          {
            name: 'lodash',
            version: '4.17.15',
            vulnerabilities: [
              {
                id: 'CVE-2021-23337',
                title: 'Prototype Pollution in Lodash',
                severity: 'high',
                description: 'Lodash versions prior to 4.17.21 are vulnerable to prototype pollution',
                fixedIn: '4.17.21',
              },
            ],
          },
        ],
      };

      // Process and store the results
      await this.processScanResults(mockResults);
      
      this.logger.log('Dependency vulnerability scan completed');
    } catch (error) {
      this.logger.error(`Error running dependency scan: ${error.message}`, error.stack);
      throw error;
    }
  }

  async runStaticCodeAnalysis(): Promise<void> {
    try {
      this.logger.log('Starting static code analysis');
      
      // Here you would integrate with a tool like SonarQube, ESLint, or other SAST tools
      // Example implementation:
      // await sonarqube({
      //   serverUrl: this.configService.get('SONARQUBE_URL'),
      //   token: this.configService.get('SONARQUBE_TOKEN'),
      //   options: {
      //     'sonar.projectKey': this.configService.get('PROJECT_KEY'),
      //     'sonar.sources': './src',
      //   },
      // });
      
      // Mock scan results for example
      const mockResults = {
        issues: [
          {
            id: 'SQL-INJECTION-001',
            title: 'Potential SQL Injection',
            severity: 'critical',
            description: 'Unvalidated user input is directly used in SQL query',
            location: 'src/users/users.service.ts:42',
          },
        ],
      };

      // Process and store the results
      await this.processScanResults(mockResults);
      
      this.logger.log('Static code analysis completed');
    } catch (error) {
      this.logger.error(`Error running static code analysis: ${error.message}`, error.stack);
      throw error;
    }
  }

  async runDynamicScan(): Promise<void> {
    try {
      this.logger.log('Starting dynamic application security testing (DAST)');
      
      // Here you would integrate with a tool like OWASP ZAP, Burp Suite, etc.
      // Example implementation:
      // const zapApi = new zap.ZapClient({
      //   apiKey: this.configService.get('ZAP_API_KEY'),
      //   proxy: this.configService.get('ZAP_PROXY_URL'),
      // });
      // 
      // await zapApi.spider.scan(this.configService.get('APP_URL'));
      // await zapApi.ascan.scan(this.configService.get('APP_URL'));
      // const results = await zapApi.core.alerts();
      
      // Mock scan results for example
      const mockResults = {
        alerts: [
          {
            id: 'XSS-001',
            title: 'Cross-Site Scripting (XSS)',
            severity: 'high',
            description: 'Reflected XSS vulnerability in search parameter',
            url: 'https://example.com/search?q=test',
          },
        ],
      };

      // Process and store the results
      await this.processScanResults(mockResults);
      
      this.logger.log('Dynamic application security testing completed');
    } catch (error) {
      this.logger.error(`Error running dynamic scan: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async processScanResults(results: any): Promise<void> {
    try {
      // Process vulnerabilities and create SecurityIssue records
      let processedIssues = [];
      
      // Example processing for dependency scan results
      if (results.vulnerabilities) {
        for (const lib of results.vulnerabilities) {
          for (const vuln of lib.vulnerabilities) {
            const issue = this.securityIssueRepository.create({
              title: `${vuln.title} in ${lib.name}@${lib.version}`,
              description: vuln.description,
              severity: this.mapSeverity(vuln.severity),
              source: IssueSource.SCAN,
              affectedComponent: `${lib.name}@${lib.version}`,
              remediationSteps: `Update ${lib.name} to version ${vuln.fixedIn} or later`,
            });
            
            processedIssues.push(await this.securityIssueRepository.save(issue));
          }
        }
      }
      
      // Example processing for static analysis results
      if (results.issues) {
        for (const issue of results.issues) {
          const secIssue = this.securityIssueRepository.create({
            title: issue.title,
            description: issue.description,
            severity: this.mapSeverity(issue.severity),
            source: IssueSource.SCAN,
            affectedComponent: issue.location,
          });
          
          processedIssues.push(await this.securityIssueRepository.save(secIssue));
        }
      }
      
      // Example processing for dynamic scan results
      if (results.alerts) {
        for (const alert of results.alerts) {
          const secIssue = this.securityIssueRepository.create({
            title: alert.title,
            description: alert.description,
            severity: this.mapSeverity(alert.severity),
            source: IssueSource.SCAN,
            affectedComponent: alert.url,
          });
          
          processedIssues.push(await this.securityIssueRepository.save(secIssue));
        }
      }
      
      // Create a security report for this scan
      const report = this.securityReportRepository.create({
        title: `Security Scan Report - ${new Date().toISOString().slice(0, 10)}`,
        type: ReportType.SCAN,
        content: JSON.stringify({
          scanDate: new Date(),
          summary: {
            total: processedIssues.length,
            critical: processedIssues.filter(i => i.severity === 'critical').length,
            high: processedIssues.filter(i => i.severity === 'high').length,
            medium: processedIssues.filter(i => i.severity === 'medium').length,
            low: processedIssues.filter(i => i.severity === 'low').length,
          },
          details: processedIssues.map(i => ({
            id: i.id,
            title: i.title,
            severity: i.severity,
            component: i.affectedComponent,
          })),
        }, null, 2),
        scanId: `scan-${Date.now()}`,
        tags: ['automated', 'security-scan'],
      });
      
      await this.securityReportRepository.save(report);
      
      // Send notifications for critical and high issues
      const criticalIssues = processedIssues.filter(i => 
        i.severity === 'critical' || i.severity === 'high'
      );
      
      if (criticalIssues.length > 0) {
        await this.notificationService.sendSecurityAlert({
          subject: `[SECURITY ALERT] ${criticalIssues.length} Critical/High vulnerabilities found`,
          content: `Security scan has identified ${criticalIssues.length} critical or high severity issues that require immediate attention.`,
          issueIds: criticalIssues.map(i => i.id),
          reportId: report.id,
        });
      }
      
    } catch (error) {
      this.logger.error(`Error processing scan results: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  private mapSeverity(severity: string): string {
    // Map severity strings from different scanners to our standard enum values
    const severityMap = {
      'critical': 'critical',
      'high': 'high',
      'medium': 'medium',
      'moderate': 'medium',
      'low': 'low',
      'info': 'info',
      'informational': 'info',
    };
    
    return severityMap[severity.toLowerCase()] || 'medium';
  }
}
