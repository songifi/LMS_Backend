export interface QuestionEffectivenessMetrics {
  id: string;
  questionId: string;
  
  // Basic metrics
  attempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  partialCorrectAttempts: number;
  
  // Rates
  successRate: number; // 0-1 scale
  discriminationIndex: number; // -1 to 1 scale
  pointBiserialCorrelation: number; // -1 to 1 scale
  
  // Time metrics
  averageTimeSpent: number; // in seconds
  medianTimeSpent: number; // in seconds
  timeDistribution: {
    under10Seconds: number;
    under30Seconds: number;
    under1Minute: number;
    under2Minutes: number;
    over2Minutes: number;
  };
  
  // Distractor analysis (for multiple choice)
  distractorAnalysis?: {
    optionId: string;
    selectionCount: number;
    selectionRate: number;
    averageScoreOfSelectors: number;
  }[];
  
  // Skip metrics
  skipCount: number;
  skipRate: number;
  
  // Hint usage
  hintUsageCount?: number;
  hintUsageRate?: number;
  
  // Revision impact
  revisionImpact?: {
    beforeRevisionSuccessRate: number;
    afterRevisionSuccessRate: number;
    improvementRate: number;
  };
  
  // Assessment context
  appearanceCount: {
    assessmentId: string;
    count: number;
  }[];
  
  // Comparison metrics
  performanceVsCategory: number; // relative to category average (%)
  performanceVsAssessment: number; // relative to assessment average (%)
  
  // Confidence
  statisticalConfidence: number; // 0-1 scale
  
  // Flags
  flags: {
    lowDiscrimination: boolean;
    highSkipRate: boolean;
    tooEasy: boolean;
    tooHard: boolean;
    suspiciousTimings: boolean;
    ineffectiveDistractors: boolean;
  };
  
  // Last updated
  lastUpdated: Date;
}

export interface AssessmentAnalyticsRequest {
  assessmentId?: string;
  categoryId?: string;
  tagIds?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  difficultyLevels?: string[];
  questionTypes?: string[];
  performanceThresholds?: {
    minSuccessRate?: number;
    maxSuccessRate?: number;
    minDiscrimination?: number;
  };
  includeHistoricalData?: boolean;
  groupBy?: 'day' | 'week' | 'month' | 'question' | 'category' | 'tag' | 'type';
}

export interface QuestionPerformanceOverTime {
  questionId: string;
  timePoints: {
    date: Date;
    successRate: number;
    attempts: number;
    averageTimeSpent: number;
    difficulty: number;
  }[];
}

export interface StudentPerformanceData {
  studentId: string;
  assessmentId: string;
  attemptId: string;
  questionId: string;
  correct: boolean;
  partialScore?: number;
  timeSpent: number;
  attemptDate: Date;
  hintUsed: boolean;
  skipped: boolean;
  response: any;
}