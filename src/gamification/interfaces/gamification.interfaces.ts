export enum BadgeType {
    ACHIEVEMENT = 'achievement',
    MILESTONE = 'milestone',
    SPECIAL = 'special',
  }
  
  export enum ChallengeStatus {
    AVAILABLE = 'available',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    EXPIRED = 'expired',
  }
  
  export enum ChallengeType {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    SPECIAL = 'special',
  }
  
  export enum RewardType {
    CERTIFICATE = 'certificate',
    CONTENT_UNLOCK = 'content_unlock',
    DISCOUNT = 'discount',
    PREMIUM_FEATURE = 'premium_feature',
  }
  
  export enum ActivityType {
    LESSON_COMPLETION = 'lesson_completion',
    QUIZ_COMPLETION = 'quiz_completion',
    COURSE_COMPLETION = 'course_completion',
    PRACTICE_SESSION = 'practice_session',
    COMMENT = 'comment',
    LIKE = 'like',
    SHARE = 'share',
    DAILY_LOGIN = 'daily_login',
  }
  
  export interface PointCalculation {
    activityType: ActivityType;
    basePoints: number;
    bonusFactor?: number;
    calculate(action: any): number;
  }
  
  export interface StreakInfo {
    userId: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date;
  }
  
  export interface LeaderboardEntry {
    userId: number;
    username: string;
    points: number;
    rank: number;
  }
  
  export interface BadgeRequirement {
    type: ActivityType;
    count: number;
    additionalParams?: Record<string, any>;
  }
  
  export interface ChallengeRequirement {
    type: ActivityType;
    count: number;
    additionalParams?: Record<string, any>;
  }