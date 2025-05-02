import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityIssue, IssueStatus, IssueSeverity, IssueSource } from '../entities/security-issue.entity';
import { NotificationService } from './notification.service';

@Injectable()
export class SecurityIssueService {
  private readonly logger = new Logger(SecurityIssueService.name);

  constructor(
    @InjectRepository(SecurityIssue)
    private securityIssueRepository: Repository<SecurityIssue>,
    private readonly notificationService: NotificationService,
  ) {}

  async getAllIssues(): Promise<SecurityIssue[]> {
    return this.securityIssueRepository.find({
      relations: ['relatedCve'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getIssueById(id: string): Promise<SecurityIssue> {
    const issue = await this.securityIssueRepository.findOne({ 
      where: { id },
      relations: ['relatedCve', 'reports'],
    });
    
    if (!issue) {
      throw new Error(`Security issue with ID ${id} not found`);
    }
    
    return issue;
  }

  async getIssuesByStatus(status: IssueStatus): Promise<SecurityIssue[]> {
    return this.securityIssueRepository.find({ 
      where: { status },
      relations: ['relatedCve'],
      order: {
        severity: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async getIssuesBySeverity(severity: IssueSeverity): Promise<SecurityIssue[]> {
    return this.securityIssueRepository.find({ 
      where: { severity },
      relations: ['relatedCve'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async createIssue(issueData: Partial<SecurityIssue>): Promise<SecurityIssue> {
    try {
      const issue = this.securityIssueRepository.create(issueData);
      const savedIssue = await this.securityIssueRepository.save(issue);
      
      // Send notification for high or critical severity issues
      if (savedIssue.severity === IssueSeverity.CRITICAL || savedIssue.severity === IssueSeverity.HIGH) {
        await this.notificationService.sendSecurityAlert({
          subject: `[SECURITY ISSUE] New ${savedIssue.severity} severity issue: ${savedIssue.title}`,
          content: `A new ${savedIssue.severity} severity security issue has been created: ${savedIssue.title}. Please review and assign.`,
          issueIds: [savedIssue.id],
        });
      }
      
      return savedIssue;
    } catch (error) {
      this.logger.error(`Error creating security issue: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateIssue(id: string, updateData: Partial<SecurityIssue>): Promise<SecurityIssue> {
    try {
      const issue = await this.getIssueById(id);
      const previousStatus = issue.status;
      
      // Apply updates
      Object.assign(issue, updateData);
      
      // Handle status transitions
      if (updateData.status && updateData.status !== previousStatus) {
        if (updateData.status === IssueStatus.RESOLVED) {
          issue.resolvedAt = new Date();
        } else if (previousStatus === IssueStatus.RESOLVED) {
          // If reopening a resolved issue
          issue.resolvedAt = null;
        }
      }
      
      const updatedIssue = await this.securityIssueRepository.save(issue);
      
      // Send notification on status change to resolved
      if (previousStatus !== IssueStatus.RESOLVED && 
          updatedIssue.status === IssueStatus.RESOLVED) {
        await this.notificationService.sendIssueStatusNotification({
          issueId: updatedIssue.id,
          title: updatedIssue.title,
          previousStatus,
          newStatus: updatedIssue.status,
          severity: updatedIssue.severity,
        });
      }
      
      return updatedIssue;
    } catch (error) {
      this.logger.error(`Error updating security issue ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async assignIssue(id: string, assignee: string): Promise<SecurityIssue> {
    return this.updateIssue(id, { assignedTo: assignee });
  }

  async getIssueSummary(): Promise<any> {
    const [
      totalCount,
      openCount,
      inProgressCount,
      resolvedCount,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
    ] = await Promise.all([
      this.securityIssueRepository.count(),
      this.securityIssueRepository.count({ where: { status: IssueStatus.OPEN } }),
      this.securityIssueRepository.count({ where: { status: IssueStatus.IN_PROGRESS } }),
      this.securityIssueRepository.count({ where: { status: IssueStatus.RESOLVED } }),
      this.securityIssueRepository.count({ where: { severity: IssueSeverity.CRITICAL } }),
      this.securityIssueRepository.count({ where: { severity: IssueSeverity.HIGH } }),
      this.securityIssueRepository.count({ where: { severity: IssueSeverity.MEDIUM } }),
      this.securityIssueRepository.count({ where: { severity: IssueSeverity.LOW } }),
    ]);
    
    return {
      total: totalCount,
      byStatus: {
        open: openCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
      },
      bySeverity: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
      },
    };
  }
}
