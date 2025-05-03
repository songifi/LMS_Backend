import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessibilityIssue } from '../entities/accessibility-issue.entity';
import { AccessibilityRemediationTask } from '../entities/accessibility-remediation-task.entity';
import { UpdateRemediationTaskDto } from '../dto/update-remediation-task.dto';

@Injectable()
export class RemediationService {
  constructor(
    @InjectRepository(AccessibilityRemediationTask)
    private remediationTaskRepository: Repository<AccessibilityRemediationTask>,
    @InjectRepository(AccessibilityIssue)
    private issueRepository: Repository<AccessibilityIssue>,
  ) {}

  async createRemediationTask(issue: AccessibilityIssue) {
    const task = this.remediationTaskRepository.create({
      issue,
      title: `Fix ${issue.wcagCriterion} issue on ${issue.url}`,
      description: `Remediate the following accessibility issue: ${issue.description}`,
      status: 'pending',
      priority: issue.priorityLevel,
      estimatedEffort: this.estimateEffort(issue.impactLevel),
    });
    
    // Update issue status
    issue.status = 'in_progress';
    await this.issueRepository.save(issue);
    
    return this.remediationTaskRepository.save(task);
  }

  async updateRemediationTask(id: string, updateRemediationTaskDto: UpdateRemediationTaskDto) {
    const task = await this.remediationTaskRepository.findOne({
      where: { id },
      relations: ['issue'],
    });
    
    if (!task) {
      throw new Error('Remediation task not found');
    }
    
    // Update task fields
    Object.assign(task, updateRemediationTaskDto);
    
    // If task is completed, update the associated issue
    if (updateRemediationTaskDto.status === 'completed' && task.issue) {
      task.completedAt = new Date();
      
      const issue = task.issue;
      issue.status = 'resolved';
      issue.resolvedAt = new Date();
      
      await this.issueRepository.save(issue);
    }
    
    return this.remediationTaskRepository.save(task);
  }

  private estimateEffort(impact: string): string {
    switch (impact) {
      case 'critical':
        return 'large';
      case 'serious':
        return 'medium';
      case 'moderate':
        return 'small';
      case 'minor':
      default:
        return 'minimal';
    }
  }
}
