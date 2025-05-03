import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';
import { DifficultyMetrics, DifficultyCalibrationResult, DifficultySettings } from '../interfaces/difficulty.interface';

@Injectable()
export class DifficultyService {
  private difficultySettings: DifficultySettings = {
    calibrationThreshold: 10, // Minimum attempts before first calibration
    calibrationFrequency: 5, // Recalibrate after every 5 new attempts
    weightFactors: {
      successRate: 0.7,
      timeSpent: 0.3,
    },
  };

  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  initializeDifficultyMetrics(initialDifficulty: number): DifficultyMetrics {
    return {
      initialDifficulty,
      currentDifficulty: initialDifficulty,
      totalAttempts: 0,
      successRate: 0,
      averageTimeSpent: 0,
      calibrationConfidence: 0,
    };
  }

  async recordResponse(
    questionId: string,
    correct: boolean,
    timeSpent: number,
    hintUsed: boolean,
    skipped: boolean,
  ): Promise<void> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });
    
    if (!question) {
      return;
    }
    
    // Update usage statistics
    question.usageCount += 1;
    if (correct) {
      question.correctCount += 1;
    } else {
      question.incorrectCount += 1;
    }
    
    // Update average time spent
    const totalTimeSpent = question.averageTimeSpent * (question.usageCount - 1) + timeSpent;
    question.averageTimeSpent = totalTimeSpent / question.usageCount;
    
    // Update difficulty metrics
    const metrics = question.difficultyMetrics;
    metrics.totalAttempts += 1;
    metrics.successRate = question.correctCount / question.usageCount;
    metrics.averageTimeSpent = question.averageTimeSpent;
    
    await this.questionRepository.save(question);
  }

  async recalibrateIfNeeded(questionId: string): Promise<DifficultyCalibrationResult | null> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });
    
    if (!question) {
      return null;
    }
    
    const metrics = question.difficultyMetrics;
    
    // Check if calibration is needed based on total attempts and calibration frequency
    const needsCalibration = 
      (metrics.totalAttempts >= this.difficultySettings.calibrationThreshold) && 
      (metrics.totalAttempts % this.difficultySettings.calibrationFrequency === 0);
    
    if (!needsCalibration) {
      return null;
    }
    
    return this.calibrateDifficulty(question);
  }

  async calibrateDifficulty(question: Question): Promise<DifficultyCalibrationResult> {
    const metrics = question.difficultyMetrics;
    const previousDifficulty = metrics.currentDifficulty;
    
    // Basic calibration algorithm
    // 1. Success rate factor: lower success rate = higher difficulty
    const successRateFactor = (1 - metrics.successRate) * 100;
    
    // 2. Time factor: higher time spent relative to expected = higher difficulty
    // Assume 30 seconds is average time for a question, normalize to 0-100 scale
    const expectedTime = 30; // in seconds
    const timeFactor = Math.min(100, (metrics.averageTimeSpent / expectedTime) * 50);
    
    // 3. Calculate new difficulty using weighted factors
    const newDifficulty = 
      successRateFactor * this.difficultySettings.weightFactors.successRate +
      timeFactor * this.difficultySettings.weightFactors.timeSpent;
    
    // 4. Update confidence based on number of attempts
    const confidenceChange = this.calculateConfidenceChange(metrics.totalAttempts);
    metrics.calibrationConfidence = Math.min(1, metrics.calibrationConfidence + confidenceChange);
    
    // 5. Update question with new difficulty
    metrics.currentDifficulty = newDifficulty;
    metrics.lastCalibrationDate = new Date();
    
    // Calculate confidence intervals
    const confidenceMargin = (1 - metrics.calibrationConfidence) * 25;
    metrics.difficultyConfidenceInterval = {
      lower: Math.max(0, newDifficulty - confidenceMargin),
      upper: Math.min(100, newDifficulty + confidenceMargin),
    };
    
    // Save the updated question
    await this.questionRepository.save(question);
    
    // Generate recommended actions based on calibration
    const recommendedActions = this.generateRecommendations(
      newDifficulty,
      metrics.successRate,
      metrics.calibrationConfidence,
    );
    
    return {
      previousDifficulty,
      newDifficulty,
      confidenceChange,
      sampleSize: metrics.totalAttempts,
      recommendedActions,
    };
  }

  private calculateConfidenceChange(totalAttempts: number): number {
    // More attempts should increase confidence, but with diminishing returns
    if (totalAttempts < 10) {
      return 0.1; // Initial confidence boost
    } else if (totalAttempts < 30) {
      return 0.05;
    } else if (totalAttempts < 100) {
      return 0.02;
    } else {
      return 0.01;
    }
  }

  private generateRecommendations(
    difficulty: number,
    successRate: number,
    confidence: number,
  ): string[] {
    const recommendations = [];
    
    if (confidence < 0.3) {
      recommendations.push('Need more student responses for reliable difficulty calibration');
    }
    
    if (difficulty > 85 && successRate < 0.3) {
      recommendations.push('Question may be too difficult; consider revision');
    }
    
    if (difficulty < 15 && successRate > 0.9) {
      recommendations.push('Question may be too easy; consider increasing difficulty');
    }
    
    if (successRate < 0.2) {
      recommendations.push('Very low success rate; verify question is clear and correct');
    }
    
    return recommendations;
  }

  // Additional methods for advanced calibration could be added here:
  // - IRT-based calibration
  // - Bayesian difficulty estimation
  // - Student ability estimation
}