import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RiskIndicator, RiskLevel } from '../entities/risk-indicator.entity';
import { Student } from '../entities/student.entity';

@Injectable()
export class RiskAssessmentService {
  constructor(
    @InjectModel(Student.name) private readonly studentModel: Model<Student>,
    @InjectModel(RiskIndicator.name) private readonly riskIndicatorModel: Model<RiskIndicator>,
  ) {}

  async assessStudentRisk(studentId: string): Promise<{
    overallRiskLevel: RiskLevel;
    riskScores: Record<string, number>;
    triggeredIndicators: RiskIndicator[];
  }> {
    const student = await this.studentModel.findById(studentId).exec();
    if (!student) {
      throw new Error(`Student with ID ${studentId} not found`);
    }

    const activeIndicators = await this.riskIndicatorModel.find({ isActive: true }).exec();
    const triggeredIndicators: RiskIndicator[] = [];
    const riskScores: Record<string, number> = {};
    let totalRiskScore = 0;
    let totalWeight = 0;

    for (const indicator of activeIndicators) {
      const isTriggered = this.evaluateIndicator(student, indicator);
      
      if (isTriggered) {
        triggeredIndicators.push(indicator);
        
        // Calculate risk score for this category
        const category = indicator.dataSource;
        if (!riskScores[category]) {
          riskScores[category] = 0;
        }
        
        // Add weighted risk score
        const weightedScore = this.getRiskLevelScore(indicator.riskLevel) * indicator.weight;
        riskScores[category] += weightedScore;
        totalRiskScore += weightedScore;
        totalWeight += indicator.weight;
      }
    }

    // Normalize risk scores to 0-100 scale
    Object.keys(riskScores).forEach(key => {
      riskScores[key] = Math.min(100, Math.round(riskScores[key] * 10));
    });

    // Calculate overall risk level
    const overallRiskLevel = this.calculateOverallRiskLevel(
      totalWeight > 0 ? totalRiskScore / totalWeight : 0,
      triggeredIndicators
    );

    // Update student with new risk assessment
    await this.studentModel.findByIdAndUpdate(studentId, {
      overallRiskLevel,
      riskScores,
    });

    return {
      overallRiskLevel,
      riskScores,
      triggeredIndicators,
    };
  }

  private evaluateIndicator(student: Student, indicator: RiskIndicator): boolean {
    const { dataSource, thresholdType, thresholdValue, thresholdUpperValue, customLogic } = indicator;
    
    // Handle custom logic if specified
    if (dataSource === 'custom' && customLogic) {
      try {
        // Simple eval of custom logic (in production, this should be more secure)
        return this.evaluateCustomLogic(student, customLogic);
      } catch (error) {
        console.error(`Error evaluating custom logic for indicator ${indicator.name}:`, error);
        return false;
      }
    }

    // Get student metric value
    const metricValue = student.metrics[dataSource];
    if (metricValue === undefined) {
      return false;
    }

    // Evaluate based on threshold type
    switch (thresholdType) {
      case 'greater_than':
        return metricValue > thresholdValue;
      case 'less_than':
        return metricValue < thresholdValue;
      case 'equal_to':
        return metricValue === thresholdValue;
      case 'between':
        return metricValue >= thresholdValue && metricValue <= thresholdUpperValue;
      default:
        return false;
    }
  }

  private evaluateCustomLogic(student: Student, customLogic: Record<string, any>): boolean {
    // This is a simplified implementation
    // In production, use a proper rule engine or safer evaluation method
    if (customLogic.type === 'combination') {
      // Example: Combine multiple conditions with AND/OR logic
      const conditions = customLogic.conditions || [];
      const operator = customLogic.operator || 'AND';
      
      if (operator === 'AND') {
        return conditions.every(condition => this.evaluateCondition(student, condition));
      } else if (operator === 'OR') {
        return conditions.some(condition => this.evaluateCondition(student, condition));
      }
    }
    
    return false;
  }

  private evaluateCondition(student: Student, condition: any): boolean {
    const { field, operator, value } = condition;
    const fieldPath = field.split('.');
    
    // Extract the field value from the student object
    let fieldValue = student;
    for (const path of fieldPath) {
      if (fieldValue === undefined || fieldValue === null) return false;
      fieldValue = fieldValue[path];
    }
    
    // Compare based on operator
    switch (operator) {
      case '==': return fieldValue == value;
      case '!=': return fieldValue != value;
      case '>': return fieldValue > value;
      case '<': return fieldValue < value;
      case '>=': return fieldValue >= value;
      case '<=': return fieldValue <= value;
      case 'contains': return Array.isArray(fieldValue) && fieldValue.includes(value);
      default: return false;
    }
  }

  private getRiskLevelScore(riskLevel: RiskLevel): number {
    switch (riskLevel) {
      case RiskLevel.LOW: return 1;
      case RiskLevel.MEDIUM: return 2;
      case RiskLevel.HIGH: return 3;
      case RiskLevel.CRITICAL: return 4;
      default: return 0;
    }
  }

  private calculateOverallRiskLevel(score: number, triggeredIndicators: RiskIndicator[]): RiskLevel {
    // Check for any critical indicators first
    if (triggeredIndicators.some(indicator => indicator.riskLevel === RiskLevel.CRITICAL)) {
      return RiskLevel.CRITICAL;
    }
    
    // Then determine based on weighted score
    if (score >= 3) {
      return RiskLevel.HIGH;
    } else if (score >= 2) {
      return RiskLevel.MEDIUM;
    } else if (score > 0) {
      return RiskLevel.LOW;
    } else {
      return RiskLevel.LOW; // Default
    }
  }
}