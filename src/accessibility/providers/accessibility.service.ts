import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessibilityIssue } from './entities/accessibility-issue.entity';
import { AccessibilityAudit } from './entities/accessibility-audit.entity';
import { AccessibilityReport } from './entities/accessibility-report.entity';
import { AccessibilityRemediationTask } from './entities/accessibility-remediation-task.entity';
import { AutomatedTestingService } from './services/automated-testing.service';
import { ManualAuditService } from './services/manual-audit.service';
import { RemediationService } from './services/remediation.service';
import { ReportingService } from './services/reporting.service';
import { RunAutomatedTestDto } from './dto/run-automated-test.dto';
import { CreateManualAuditDto } from './dto/create-manual-audit.dto';
import { UpdateRemediationTaskDto } from './dto/update-remediation-task.dto';
import { GenerateReportDto } from './dto/generate-report.dto';

@Injectable()
export class AccessibilityService {
  constructor(
    @InjectRepository(AccessibilityIssue)
    private issueRepository: Repository<AccessibilityIssue>,
    @InjectRepository(AccessibilityAudit)
    private auditRepository: Repository<AccessibilityAudit>,
    @InjectRepository(AccessibilityReport)
    private reportRepository: Repository<AccessibilityReport>,
    @InjectRepository(AccessibilityRemediationTask)
    private remediationTaskRepository: Repository<AccessibilityRemediationTask>,
    private automatedTestingService: AutomatedTestingService,
    private manualAuditService: ManualAuditService,
    private remediationService: RemediationService,
    private reportingService: ReportingService,
  ) {}

  async runAutomatedTest(runAutomatedTestDto: RunAutomatedTestDto) {
    const testResults = await this.automatedTestingService.runTests(runAutomatedTestDto);
    
    // Create accessibility issues from test results
    const savedIssues = [];
    for (const result of testResults) {
      const issue = this.issueRepository.create({
        type: 'automated',
        wcagCriterion: result.wcagCriterion,
        description: result.description,
        impactLevel: result.impact,
        status: 'open',
        url: result.url,
        htmlSnippet: result.htmlSnippet,
        elementPath: result.elementPath,
        priorityLevel: this.calculatePriorityLevel(result.impact),
        detectedAt: new Date(),
      });
      savedIssues.push(await this.issueRepository.save(issue));
    }
    
    return savedIssues;
  }

  async createManualAudit(createManualAuditDto: CreateManualAuditDto) {
    return this.manualAuditService.createAudit(createManualAuditDto);
  }

  async findAllIssues(status?: string, priority?: string) {
    const query = this.issueRepository.createQueryBuilder('issue');
    
    if (status) {
      query.andWhere('issue.status = :status', { status });
    }
    
    if (priority) {
      query.andWhere('issue.priorityLevel = :priority', { priority });
    }
    
    return query.getMany();
  }

  async findIssueById(id: string) {
    return this.issueRepository.findOne({ where: { id } });
  }

  async createRemediationTask(issueId: string) {
    const issue = await this.issueRepository.findOne({ where: { id: issueId } });
    if (!issue) {
      throw new Error('Issue not found');
    }
    
    return this.remediationService.createRemediationTask(issue);
  }

  async updateRemediationTask(id: string, updateRemediationTaskDto: UpdateRemediationTaskDto) {
    return this.remediationService.updateRemediationTask(id, updateRemediationTaskDto);
  }

  async generateReport(generateReportDto: GenerateReportDto) {
    return this.reportingService.generateReport(generateReportDto);
  }

  async findAllReports() {
    return this.reportRepository.find();
  }

  async findReportById(id: string) {
    return this.reportRepository.findOne({ where: { id } });
  }

  private calculatePriorityLevel(impact: string): 'high' | 'medium' | 'low' {
    switch (impact) {
      case 'critical':
      case 'serious':
        return 'high';
      case 'moderate':
        return 'medium';
      case 'minor':
      default:
        return 'low';
    }
  }
}
