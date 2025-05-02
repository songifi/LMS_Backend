import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessibilityAudit } from '../entities/accessibility-audit.entity';
import { AccessibilityIssue } from '../entities/accessibility-issue.entity';
import { CreateManualAuditDto } from '../dto/create-manual-audit.dto';

@Injectable()
export class ManualAuditService {
  constructor(
    @InjectRepository(AccessibilityAudit)
    private auditRepository: Repository<AccessibilityAudit>,
    @InjectRepository(AccessibilityIssue)
    private issueRepository: Repository<AccessibilityIssue>,
  ) {}

  async createAudit(createManualAuditDto: CreateManualAuditDto) {
    const audit = this.auditRepository.create({
      type: 'manual',
      name: createManualAuditDto.name,
      description: createManualAuditDto.description,
      auditor: createManualAuditDto.auditor,
      status: 'in_progress',
      metadata: createManualAuditDto.metadata,
    });
    
    const savedAudit = await this.auditRepository.save(audit);
    
    // Create issues if they are provided
    if (createManualAuditDto.issues && createManualAuditDto.issues.length > 0) {
      const issues = createManualAuditDto.issues.map(issueDto => {
        return this.issueRepository.create({
          type: 'manual',
          wcagCriterion: issueDto.wcagCriterion,
          description: issueDto.description,
          impactLevel: issueDto.impactLevel,
          priorityLevel: this.calculatePriorityLevel(issueDto.impactLevel),
          status: 'open',
          url: issueDto.url,
          htmlSnippet: issueDto.htmlSnippet,
          elementPath: issueDto.elementPath,
          recommendations: issueDto.recommendations,
          detectedAt: new Date(),
        });
      });
      
      await this.issueRepository.save(issues);
    }
    
    return savedAudit;
  }

  async completeAudit(auditId: string, issues: any[]) {
    const audit = await this.auditRepository.findOne({ where: { id: auditId } });
    if (!audit) {
      throw new Error('Audit not found');
    }
    
    // Create issues
    if (issues && issues.length > 0) {
      const issueEntities = issues.map(issueDto => {
        return this.issueRepository.create({
          type: 'manual',
          wcagCriterion: issueDto.wcagCriterion,
          description: issueDto.description,
          impactLevel: issueDto.impactLevel,
          priorityLevel: this.calculatePriorityLevel(issueDto.impactLevel),
          status: 'open',
          url: issueDto.url,
          htmlSnippet: issueDto.htmlSnippet,
          elementPath: issueDto.elementPath,
          recommendations: issueDto.recommendations,
          detectedAt: new Date(),
        });
      });
      
      await this.issueRepository.save(issueEntities);
    }
    
    // Update audit status
    audit.status = 'completed';
    audit.completedAt = new Date();
    
    return this.auditRepository.save(audit);
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
