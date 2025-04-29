import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Challenge } from '../entities/challenge.entity';
import { ChallengeDto, UserChallengeDto, CompleteChallengeDto } from '../dto/challenge.dto';
import { PointService } from './point.service';
import { BadgeService } from './badge.service';
import { ChallengeStatus } from '../interfaces/gamification.interfaces';
import { UserBadgeDto } from '../dto/badge.dto';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
    private pointService: PointService,
    private badgeService: BadgeService,
  ) {}

  async createChallenge(challengeDto: ChallengeDto): Promise<Challenge> {
    const challenge = this.challengeRepository.create(challengeDto);
    return this.challengeRepository.save(challenge);
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    const now = new Date();
    return this.challengeRepository.find({
      where: {
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
    });
  }

  async getUserChallenges(userId: number): Promise<UserChallengeDto[]> {
    const activeChallenges = await this.getActiveChallenges();
    
    // In a real app, you would check the user's progress on each challenge
    // from a user_challenges table or similar
    
    // Mock implementation - transform challenges to UserChallengeDto
    return activeChallenges.map(challenge => ({
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      type: challenge.type,
      requirements: challenge.requirements,
      pointsReward: challenge.pointsReward,
      badgeRewardId: challenge.badgeRewardId,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      // Mock values for user-specific fields
      status: Math.random() > 0.7 ? ChallengeStatus.COMPLETED : 
              Math.random() > 0.5 ? ChallengeStatus.IN_PROGRESS : ChallengeStatus.AVAILABLE,
      progress: Math.floor(Math.random() * 100),
    }));
  }

  async completeChallenge(completeChallengeDto: CompleteChallengeDto): Promise<any> {
    const { challengeId, userId } = completeChallengeDto;
    
    // In a real app, verify the user has actually completed all requirements
    const challenge = await this.challengeRepository.findOne({ where: { id: challengeId } });
    if (!challenge) {
      throw new Error('Challenge not found');
    }
    
    // Award points for completing the challenge
    const pointsAwarded = await this.pointService.awardPoints({
      userId,
      amount: challenge.pointsReward,
      activityType: 'challenge_completion',
      activityId: challengeId,
      metadata: { challengeName: challenge.name },
    });
    
    // Award badge if applicable
    let badgeAwarded: UserBadgeDto | null = null;
    if (challenge.badgeRewardId) {
        badgeAwarded = await this.badgeService.awardBadge(userId, challenge.badgeRewardId);
    }

    
    // In a real app, update the user's challenge status in the database
    
    return {
      success: true,
      challengeId,
      pointsAwarded: pointsAwarded.amount,
      badgeAwarded,
    };
  }
}