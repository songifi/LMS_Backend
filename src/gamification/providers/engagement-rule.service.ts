import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EngagementRule } from '../entities/engagement-rule.entity';
import { ActivityType } from '../interfaces/gamification.interfaces';

@Injectable()
export class EngagementRuleService {
  constructor(
    @InjectRepository(EngagementRule)
    private ruleRepository: Repository<EngagementRule>,
  ) {}

  async createRule(rule: Partial<EngagementRule>): Promise<EngagementRule> {
    const newRule = this.ruleRepository.create(rule);
    return this.ruleRepository.save(newRule);
  }

  async getRules(): Promise<EngagementRule[]> {
    return this.ruleRepository.find();
  }

  async getRuleForActivity(activityType: ActivityType): Promise<EngagementRule> {
    const rule = await this.ruleRepository.findOne({ where: { activityType } });
    if (!rule) {
      throw new Error(`No rule found for activity type: ${activityType}`);
    }
    return rule;
  }
  
  async updateRule(id: number, updates: Partial<EngagementRule>): Promise<EngagementRule> {
    await this.ruleRepository.update(id, updates);
    const updatedRule = await this.ruleRepository.findOne({ where: { id } });
    if (!updatedRule) {
      throw new Error(`Rule with ID ${id} not found`);
    }
    return updatedRule;
  }
  
}