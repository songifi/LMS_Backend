import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, IsObject, Min } from 'class-validator';

export class CreateAssessmentDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsObject()
  @IsOptional()
  instructions?: {
    before?: string;
    during?: string;
    after?: string;
  };

  @IsNumber()
  @Min(0)
  timeLimit: number; // in minutes, 0 for unlimited

  @IsArray()
  @IsOptional()
  questionIds?: string[];

  @IsObject()
  @IsOptional()
  questionSelection?: {
    method: 'fixed' | 'random' | 'adaptive';
    count?: number;
    categories?: {
      categoryId: string;
      count: number;
      difficulty?: 'mixed' | 'easy' | 'medium' | 'hard';
    }[];
    difficultyDistribution?: {
      easy: number;
      medium: number;
      hard: number;
    };
  };

  @IsObject()
  @IsOptional()
  conditionalLogic?: {
    sections?: {
      id: string;
      title: string;
      questionIds: string[];
      requiredScore?: number;
      nextSectionRules?: {
        condition: string;
        nextSectionId: string;
      }[];
    }[];
    adaptiveRules?: {
      initialDifficulty: 'easy' | 'medium' | 'hard';
      adjustmentRules: {
        consecutiveCorrect: number;
        consecutiveIncorrect: number;
        difficultyChange: number;
      };
    };
  };

  @IsObject()
  @IsOptional()
  scoringRules?: {
    passingScore: number;
    method: 'simple' | 'weighted' | 'custom';
    penaltyForWrong?: number;
    bonusForTime?: {
      threshold: number;
      bonus: number;
    };
    categoryWeights?: {
      categoryId: string;
      weight: number;
    }[];
  };

  @IsBoolean()
  @IsOptional()
  shuffleQuestions?: boolean;

  @IsBoolean()
  @IsOptional()
  showResults?: boolean;

  @IsBoolean()
  @IsOptional()
  allowReview?: boolean;

  @IsBoolean()
  @IsOptional()
  allowRetake?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxAttempts?: number; // 0 for unlimited

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsArray()
  @IsOptional()
  tagIds?: string[];

  @IsArray()
  @IsOptional()
  categoryIds?: string[];

  @IsString()
  @IsOptional()
  createdBy?: string;
}