export interface DifficultyMetrics {
  initialDifficulty: number; // 0-100 scale
  currentDifficulty: number; // 0-100 scale
  
  // Student performance metrics
  totalAttempts: number;
  successRate: number; // 0-1 scale
  averageTimeSpent: number; // in seconds
  
  // Item Response Theory parameters (if applicable)
  discrimination?: number; // a-parameter
  difficulty?: number; // b-parameter
  guessing?: number; // c-parameter
  
  // Calibration metrics
  lastCalibrationDate?: Date;
  calibrationConfidence: number; // 0-1 scale
  
  // Confidence intervals
  difficultyConfidenceInterval?: {
    lower: number;
    upper: number;
  };
}

export interface DifficultyCalibrationResult {
  previousDifficulty: number;
  newDifficulty: number;
  confidenceChange: number;
  sampleSize: number;
  recommendedActions?: string[];
}

export interface DifficultyDistribution {
  veryEasy: number; // percentage (0-100)
  easy: number;
  medium: number;
  hard: number;
  veryHard: number;
}

export enum DifficultyLevel {
  VERY_EASY = 'VERY_EASY',
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  VERY_HARD = 'VERY_HARD',
}

export interface DifficultySettings {
  calibrationThreshold: number; // minimum attempts before calibration
  calibrationFrequency: number; // number of attempts between recalibrations
  weightFactors: {
    successRate: number;
    timeSpent: number;
    skipRate?: number;
    hintUsage?: number;
  };
}