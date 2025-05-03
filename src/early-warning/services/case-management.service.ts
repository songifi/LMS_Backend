import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Case, CaseStatus, TriggerType } from '../entities/case.entity';
import { Intervention } from '../entities/intervention.entity';
import { RiskIndicator } from '../entities/risk-indicator.entity';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
import { CreateCaseDto, UpdateCaseDto } from '../dtos/case.dto';
import { InterventionRecommendationService } from './intervention-recommendation.service';

@Injectable()
export class CaseManagementService {
  constructor(
    @InjectModel(Case.name) private readonly caseModel: Model<Case>,
    @InjectModel(Student.name) private readonly studentModel: Model<Student>,
    @InjectModel(RiskIndicator.name) private readonly riskIndicatorModel: Model<RiskIndicator>,
    @InjectModel(Intervention.name) private readonly interventionModel: Model<Intervention>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly interventionRecommendationService: InterventionRecommendationService,
  ) {}

  async createCase(createCaseDto: CreateCaseDto, userId?: string): Promise<Case> {
    const {
      student: studentId,
      triggeringIndicators,
      note,
      timelineEntry,
      ...caseData
    } = createCaseDto;

    // Verify student exists
    const student = await this.studentModel.findById(studentId).exec();
    if (!student) {
      throw new Error(`Student with ID ${studentId} not found`);
    }

    // Get recommended interventions if not provided
    let recommendedInterventions = caseData.recommendedInterventions || [];
    if (triggeringIndicators?.length && recommendedInterventions.length === 0) {
      const recommendations = await this.interventionRecommendationService.recommendInterventions(
        studentId,
        triggeringIndicators,
      );
      recommendedInterventions = recommendations.map(r => r._id);
    }

    // Create case
    const newCase = new this.caseModel({
      ...caseData,
      student: studentId,
      triggeringIndicators,
      recommendedInterventions,
      createdBy: userId,
    });

    // Add initial note if provided
    if (note) {
      newCase.notes = [{
        content: note.content,
        createdAt: new Date(),
        createdBy: userId,
      }];
    }

    // Add initial timeline entry
    const initialTimelineEntry = {
      action: 'CASE_CREATED',
      description: timelineEntry?.description || 'Case created',
      timestamp: new Date(),
      user: userId,
    };
    
    newCase.timeline = [initialTimelineEntry];

    // Update student's cases
    await this.studentModel.findByIdAndUpdate(
      studentId,
      {
        $push: { cases: newCase._id },
        $set: { hasActiveIntervention: true },
      },
    );

    return newCase.save();
  }

  async updateCase(id: string, updateCaseDto: UpdateCaseDto, userId?: string): Promise<Case> {
    const existingCase = await this.caseModel.findById(id).exec();
    if (!existingCase) {
      throw new Error(`Case with ID ${id} not found`);
    }

    const { note, timelineEntry, outcome, ...updateData } = updateCaseDto;

    // Track status change
    const statusChanged = updateData.status && updateData.status !== existingCase.status;
    if (statusChanged) {
      // Add timeline entry for status change
      const statusTimelineEntry = {
        action: 'STATUS_CHANGED',
        description: `Status changed from ${existingCase.status} to ${updateData.status}`,
        timestamp: new Date(),
        user: userId,
      };
      updateData['$push'] = { timeline: statusTimelineEntry };
    }

    // Add note if provided
    if (note) {
      if (!updateData['$push']) updateData['$push'] = {};
      updateData['$push'].notes = {
        content: note.content,
        createdAt: new Date(),
        createdBy: userId,
      };
    }

    // Add timeline entry if provided
    if (timelineEntry) {
      if (!updateData['$push']) updateData['$push'] = {};
      updateData['$push'].timeline = {
        ...timelineEntry,
        timestamp: new Date(),
        user: userId,
      };
    }

    // Handle case closure
    if (updateData.status && 
        (updateData.status === CaseStatus.CLOSED_SUCCESSFUL ||
         updateData.status === CaseStatus.CLOSED_UNSUCCESSFUL || 
         updateData.status === CaseStatus.CLOSED_NO_ACTION)) {
      
      updateData.closedDate = updateData.closedDate || new Date();
      
      // If outcome provided, store it
      if (outcome) {
        updateData.outcomes = outcome;

        // Track intervention effectiveness
        if (existingCase.appliedInterventions && existingCase.appliedInterventions.length > 0) {
          for (const interventionId of existingCase.appliedInterventions) {
            await this.interventionRecommendationService.trackInterventionEffectiveness(
              interventionId.toString(),
              outcome.successful
            );
          }
        }
      }
      
      // Update student's active intervention status if no other active cases
      const activeCount = await this.caseModel.countDocuments({
        student: existingCase.student,
        status: { $in: [CaseStatus.OPEN, CaseStatus.IN_PROGRESS, CaseStatus.MONITORING] },
        _id: { $ne: existingCase._id },
      });
      
      if (activeCount === 0) {
        await this.studentModel.findByIdAndUpdate(
          existingCase.student,
          { hasActiveIntervention: false }
        );
      }
    }

    return this.caseModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async autoCreateCase(
    studentId: string, 
    triggeredIndicators: RiskIndicator[],
    triggerType: TriggerType = TriggerType.AUTOMATED
  ): Promise<Case> {
    if (!triggeredIndicators.length) {
      throw new Error('No indicators provided for automatic case creation');
    }

    // Get student details
    const student = await this.studentModel.findById(studentId).exec();
    if (!student) {
      throw new Error(`Student with ID ${studentId} not found`);
    }

    // Check if student already has an active case
    const hasActiveCase = await this.caseModel.exists({
      student: studentId,
      status: { $in: [CaseStatus.OPEN, CaseStatus.IN_PROGRESS] },
    });

    if (hasActiveCase) {
      // Update existing case instead of creating a new one
      const activeCase = await this.caseModel.findOne({
        student: studentId,
        status: { $in: [CaseStatus.OPEN, CaseStatus.IN_PROGRESS] },
      });

      // Add new indicators to the existing case
      const indicatorIds = triggeredIndicators.map(i => i._id);
      return this.updateCase(
        activeCase._id,
        {
          triggeringIndicators: [...activeCase.triggeringIndicators, ...indicatorIds],
          note: {
            content: 'Automatic update: New risk indicators detected',
          },
          timelineEntry: {
            action: 'INDICATORS_ADDED',
            description: 'New risk indicators automatically added to case',
          },
        }
      );
    }
    
    // Create new case
    const indicatorIds = triggeredIndicators.map(i => i._id);
    const recommendedInterventions = await this.interventionRecommendationService
      .recommendInterventions(studentId, triggeredIndicators);
    
    // Find appropriate case manager based on indicators
    const assignedTo = await this.findAppropriateManager(triggeredIndicators);
    
    // Generate case title based on top risk
    const highestRiskIndicator = [...triggeredIndicators]
      .sort((a, b) => this.getRiskLevelValue(b.riskLevel) - this.getRiskLevelValue(a.riskLevel))[0];
    
    const caseTitle = `${highestRiskIndicator.riskLevel.toUpperCase()} Risk: ${highestRiskIndicator.name}`;
    
    const createCaseDto: CreateCaseDto = {
      student: studentId,
      title: caseTitle,
      description: `Automatically generated case based on ${triggeredIndicators.length} risk indicators`,
      triggerType,
      triggeringIndicators: indicatorIds,
      recommendedInterventions: recommendedInterventions.map(i => i._id.toString()),
      assignedTo: assignedTo?.toString(),
      timelineEntry: {
        action: 'CASE_CREATED',
        description: 'Case automatically created by system',
      },
    };
    
    return this.createCase(createCaseDto);
  }

  private getRiskLevelValue(riskLevel: string): number {
    const levels = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4,
    };
    return levels[riskLevel] || 0;
  }

  private async findAppropriateManager(indicators: RiskIndicator[]): Promise<string | null> {
    // Simple implementation - match based on indicator types
    // In a real app, this would be more sophisticated
    const indicatorTypes = [...new Set(indicators.map(i => i.dataSource))];
    
    // Map indicator types to relevant user roles
    const roleMap = {
      'attendance': 'case_manager',
      'assignment': 'teacher',
      'grade': 'teacher',
      'engagement': 'counselor',
      'behavior': 'counselor',
    };
    
    // Get most appropriate role based on indicators
    let primaryRole = 'case_manager'; // Default
    for (const type of indicatorTypes) {
      if (roleMap[type]) {
        primaryRole = roleMap[type];
        break;
      }
    }
    
    // Find available user with matching role
    const user = await this.userModel.findOne({
      roles: primaryRole,
      isActive: true,
    }).exec();
    
    return user?._id || null;
  }
}