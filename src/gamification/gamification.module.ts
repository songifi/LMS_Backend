// gamification/gamification.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Config
import gamificationConfig from './gamification.config';

// Entities
import { Point } from './entities/point.entity';
import { Badge } from './entities/badge.entity';
import { Leaderboard } from './entities/leaderboard.entity';
import { Challenge } from './entities/challenge.entity';
import { Reward } from './entities/reward.entity';
import { EngagementRule } from './entities/engagement-rule.entity';
import { ActivityStreak } from './entities/activity-streak.entity';
import { GamificationService } from './providers/gamification.service';
import { BadgeService } from './providers/badge.service';
import { LeaderboardService } from './providers/leaderboard.service';
import { ChallengeService } from './providers/challenge.service';
import { RewardService } from './providers/reward.service';
import { PointService } from './providers/point.service';
import { PointController } from './controllers/point.controller';
import { BadgeController } from './controllers/badge.controller';
import { LeaderboardController } from './controllers/leaderboard.controller';
import { ChallengeController } from './controllers/challenge.controller';
import { RewardController } from './controllers/reward.controller';
import { StreakController } from './controllers/streak.controller';
import { EngagementRuleService } from './providers/engagement-rule.service';
import { StreakService } from './providers/streak.service';

// Services

// Controllers

@Module({
  imports: [
    ConfigModule.forFeature(gamificationConfig),
    TypeOrmModule.forFeature([
      Point,
      Badge,
      Leaderboard,
      Challenge,
      Reward,
      EngagementRule,
      ActivityStreak,
    ]),
  ],
  providers: [
    PointService,
    BadgeService,
    LeaderboardService,
    ChallengeService,
    RewardService,
    EngagementRuleService,
    StreakService,
    GamificationService,
  ],
  controllers: [
    PointController,
    BadgeController,
    LeaderboardController,
    ChallengeController,
    RewardController,
    StreakController,
  ],
  exports: [
    GamificationService,
    PointService,
    BadgeService,
    LeaderboardService,
    ChallengeService,
    RewardService,
  ],
})
export class GamificationModule {}