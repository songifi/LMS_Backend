import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Intervention } from '../entities/intervention.entity';
import { RiskIndicator, RiskLevel } from '../entities/risk-indicator.entity';
import { Student } from '../entities/student.entity';

@Injectable()
export class InterventionRecommendationService {
  constructor(
    @InjectModel(Intervention.name) private readonly interventionModel: Model<Intervention>,
    @InjectModel(Student.name) private readonly studentModel: Model<Student>,
    @InjectModel(RiskIndicator.name) private readonly riskIndicatorModel: Model<RiskIndicator>,
  ) {}

  async recommendInterventions(
    studentId: string,
    triggeredIndicators: string[] | RiskIndicator[],
    overallRiskLevel?: RiskLevel,
  ): Promise<Intervention[]> {
    // Load student and convert indicator IDs to objects if necessary
    const student = await this.studentModel.findById(studentId).exec();
    if (!student) {
      throw new Error(`Student with ID ${studentId} not found`);
    }

    let indicators: RiskIndicator[];
    if (typeof triggeredIndicators[0] === 'string') {
      indicators = await this.riskIndicatorModel
        .find({ _id: { $in: triggeredIndicators } })
        .exec();
    } else {
      indicators = triggeredIndicators as RiskIndicator[];
    }

    // Get active interventions
    const allInterventions = await this.interventionModel
      .find({ isActive: true })
      .exec();

    // Extract key information from indicators
    const riskLevel = overallRiskLevel || student.overallRiskLevel;
    const indicatorTypes = indicators.map(i => i.dataSource);
    const indicatorIds = indicators.map(i => i._id.toString());
    const indicatorCategories = indicators.map(i => i.category).filter(Boolean);

    // Score and rank interventions
    const scoredInterventions = allInterventions.map(intervention => {
      let score = 0;

      // 1. Risk level match
      if (intervention.targetRiskLevels.includes(riskLevel)) {
        score += 30;
      }

      // 2. Specific indicator match
      const targetIndicatorsMatch = intervention.targetIndicators.some(target => 
        indicatorIds.includes(target));
      if (targetIndicatorsMatch) {
        score += 40;
      }

      // 3. Intervention type match with indicator data source
      const typeMatches = indicatorTypes.some(type => 
        intervention.type.toLowerCase() === type.toLowerCase());
      if (typeMatches) {
        score += 20;
      }

      // 4. Success rate bonus
      score += Math.min(10, intervention.successRate / 10);

      // Return scored intervention
      return {
        intervention,
        score,
      };
    });

    // Sort by score and take top recommendations
    const recommendedInterventions = scoredInterventions
      .sort((a, b) => b.score - a.score)
      .filter(item => item.score > 20) // Only recommend if there's a decent match
      .map(item => item.intervention);

    // Limit to 5 recommendations
    return recommendedInterventions.slice(0, 5);
  }

  async trackInterventionEffectiveness(interventionId: string, successful: boolean): Promise<void> {
    // Update success rate based on outcomes
    const intervention = await this.interventionModel.findById(interventionId).exec();
    if (!intervention) {
      throw new Error(`Intervention with ID ${interventionId} not found`);
    }

    // Simple moving average algorithm for success rate
    const currentRate = intervention.successRate || 0;
    const weight = 0.9; // Weight for historical data vs. new outcome
    const newOutcome = successful ? 100 : 0;
    const updatedRate = (currentRate * weight) + (newOutcome * (1 - weight));

    await this.interventionModel.findByIdAndUpdate(interventionId, {
      successRate: updatedRate,
    }).exec();
  }
}