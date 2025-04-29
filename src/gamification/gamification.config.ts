// gamification/gamification.config.ts
import { registerAs } from '@nestjs/config';

// Define ActivityType enum if not already defined elsewhere
export enum ActivityType {
  LESSON_COMPLETION = 'LESSON_COMPLETION',
  QUIZ_COMPLETION = 'QUIZ_COMPLETION',
  COURSE_COMPLETION = 'COURSE_COMPLETION',
  PRACTICE_SESSION = 'PRACTICE_SESSION',
  COMMENT = 'COMMENT',
  LIKE = 'LIKE',
  SHARE = 'SHARE',
  DAILY_LOGIN = 'DAILY_LOGIN',
  CHALLENGE_COMPLETION = 'CHALLENGE_COMPLETION',
}

export default registerAs('gamification', () => ({
  defaultRules: {
    [ActivityType.LESSON_COMPLETION]: {
      basePoints: 10,
      maxPoints: 20,
      multiplier: 1.0,
      dailyLimit: 10,
    },
    [ActivityType.QUIZ_COMPLETION]: {
      basePoints: 15,
      maxPoints: 30,
      multiplier: 1.0,
      dailyLimit: 5,
    },
    [ActivityType.COURSE_COMPLETION]: {
      basePoints: 50,
      maxPoints: 100,
      multiplier: 1.0,
      dailyLimit: 3,
    },
    [ActivityType.PRACTICE_SESSION]: {
      basePoints: 5,
      maxPoints: 20,
      multiplier: 1.0,
      dailyLimit: 5,
    },
    [ActivityType.COMMENT]: {
      basePoints: 2,
      maxPoints: 10,
      multiplier: 1.0,
      dailyLimit: 10,
    },
    [ActivityType.LIKE]: {
      basePoints: 1,
      maxPoints: 5,
      multiplier: 1.0,
      dailyLimit: 20,
    },
    [ActivityType.SHARE]: {
      basePoints: 5,
      maxPoints: 15,
      multiplier: 1.0,
      dailyLimit: 5,
    },
    [ActivityType.DAILY_LOGIN]: {
      basePoints: 5,
      maxPoints: 5,
      multiplier: 1.0,
      dailyLimit: 1,
    },
    [ActivityType.CHALLENGE_COMPLETION]: {
      basePoints: 25,
      maxPoints: 50,
      multiplier: 1.0,
      dailyLimit: 3,
    },
  },
  streakConfig: {
    streakMultiplierCap: 2.0, // Maximum multiplier from streaks
    streakMultiplierStep: 0.1, // Increase multiplier by this amount each day of streak
    streakResetDays: 2, // Number of days of inactivity before streak resets
    streakMilestones: {
      7: { badge: 'WEEKLY_WARRIOR', points: 50 },
      30: { badge: 'MONTHLY_MASTER', points: 200 },
      100: { badge: 'CENTURY_CHAMPION', points: 500 },
      365: { badge: 'YEARLY_LEGEND', points: 1000 },
    },
  },
  badgeConfig: {
    categories: [
      {
        id: 'achievement',
        name: 'Achievement Badges',
        description: 'Badges earned through specific accomplishments',
      },
      {
        id: 'streak',
        name: 'Streak Badges',
        description: 'Badges earned through consistent activity',
      },
      {
        id: 'milestone',
        name: 'Milestone Badges',
        description: 'Badges earned through cumulative progress',
      },
      {
        id: 'special',
        name: 'Special Badges',
        description: 'Limited edition and special event badges',
      },
    ],
    defaultBadges: [
      {
        id: 'FIRST_LESSON',
        name: 'First Steps',
        description: 'Complete your first lesson',
        category: 'achievement',
        imageUrl: '/assets/badges/first-lesson.png',
        pointValue: 10,
      },
      {
        id: 'QUIZ_MASTER',
        name: 'Quiz Master',
        description: 'Score 100% on 5 quizzes',
        category: 'achievement',
        imageUrl: '/assets/badges/quiz-master.png',
        pointValue: 50,
      },
      {
        id: 'COURSE_GRADUATE',
        name: 'Course Graduate',
        description: 'Complete your first full course',
        category: 'milestone',
        imageUrl: '/assets/badges/course-graduate.png',
        pointValue: 100,
      },
    ],
  },
  leaderboardConfig: {
    types: [
      {
        id: 'daily',
        name: 'Daily Leaders',
        description: 'Top performers in the last 24 hours',
        resetPeriod: 'day',
      },
      {
        id: 'weekly',
        name: 'Weekly Champions',
        description: 'Top performers in the last 7 days',
        resetPeriod: 'week',
      },
      {
        id: 'monthly',
        name: 'Monthly Masters',
        description: 'Top performers in the last 30 days',
        resetPeriod: 'month',
      },
      {
        id: 'allTime',
        name: 'All-Time Legends',
        description: 'Top performers since the beginning',
        resetPeriod: 'never',
      },
    ],
    defaultPageSize: 10,
    maxRankings: 100,
  },
  challengeConfig: {
    types: [
      {
        id: 'daily',
        name: 'Daily Challenge',
        description: 'Complete within 24 hours',
        duration: 24, // hours
      },
      {
        id: 'weekly',
        name: 'Weekly Challenge',
        description: 'Complete within 7 days',
        duration: 168, // hours (7 days)
      },
      {
        id: 'special',
        name: 'Special Challenge',
        description: 'Limited-time special events',
        duration: 72, // hours (3 days)
      },
    ],
    defaultChallenges: [
      {
        id: 'COMPLETE_3_LESSONS',
        name: 'Lesson Sprint',
        description: 'Complete 3 lessons in a single day',
        type: 'daily',
        requirements: {
          activityType: ActivityType.LESSON_COMPLETION,
          count: 3,
        },
        reward: {
          points: 30,
          badge: 'LESSON_SPRINTER',
        },
      },
      {
        id: 'PERFECT_QUIZ',
        name: 'Perfect Score',
        description: 'Score 100% on a quiz',
        type: 'daily',
        requirements: {
          activityType: ActivityType.QUIZ_COMPLETION,
          score: 100,
          count: 1,
        },
        reward: {
          points: 25,
        },
      },
    ],
  },
  rewardConfig: {
    types: [
      {
        id: 'certificate',
        name: 'Certificates',
        description: 'Digital certificates of achievement',
      },
      {
        id: 'discount',
        name: 'Discounts',
        description: 'Special offers on premium content',
      },
      {
        id: 'feature',
        name: 'Feature Unlocks',
        description: 'Access to special platform features',
      },
    ],
    defaultRewards: [
      {
        id: 'PREMIUM_WEEK',
        name: 'Free Premium Week',
        description: '7 days of premium access',
        type: 'feature',
        pointCost: 500,
        limitPerUser: 3,
      },
      {
        id: 'COURSE_DISCOUNT',
        name: '25% Off Any Course',
        description: 'Discount on a course of your choice',
        type: 'discount',
        pointCost: 300,
        limitPerUser: 5,
      },
    ],
  },
  engagementRules: {
    bonusMultipliers: {
      weekendBonus: 1.5, // bonus multiplier for weekend activity
      offHoursBonus: 1.2, // bonus for engaging during off-peak hours
      comebackBonus: 1.5, // bonus for returning after absence (but not enough to reset streak)
    },
    qualityFactors: {
      // Factors that affect point calculation based on quality of engagement
      contentLength: 0.1, // per length unit
      mediaInclusion: 1.2, // multiplier when media is included
      communityRating: 0.2, // per star/like from community
    },
  },
}));