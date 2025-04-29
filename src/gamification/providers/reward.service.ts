import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from '../entities/reward.entity';
import { RewardDto, UserRewardDto } from '../dto/reward.dto';
import { PointService } from './point.service';

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
    private pointService: PointService,
  ) {}

  async createReward(rewardDto: RewardDto): Promise<Reward> {
    const reward = this.rewardRepository.create(rewardDto);
    return this.rewardRepository.save(reward);
  }

  async getRewards(): Promise<Reward[]> {
    return this.rewardRepository.find();
  }

  async getUserRewards(userId: number): Promise<UserRewardDto[]> {
    const rewards = await this.getRewards();
    const userPoints = await this.pointService.getUserPoints(userId);
    
    // In a real app, you would query a user_rewards table to see which
    // rewards the user has already unlocked
    
    // Mock implementation
    return rewards.map(reward => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      type: reward.type,
      pointsCost: reward.pointsCost,
      unlockRequirements: reward.unlockRequirements,
      imageUrl: reward.imageUrl,
      // Mock values for user-specific fields
      isUnlocked: Math.random() > 0.5, // 50% chance the reward is unlocked
      canAfford: userPoints.totalPoints >= reward.pointsCost,
    }));
  }

  async redeemReward(userId: number, rewardId: number): Promise<any> {
    const reward = await this.rewardRepository.findOne({ where: { id: rewardId } });
    if (!reward) {
      throw new Error('Reward not found');
    }
    
    const userPoints = await this.pointService.getUserPoints(userId);
    if (userPoints.totalPoints < reward.pointsCost) {
      throw new Error('Not enough points to redeem this reward');
    }
    
    // In a real app, deduct points and record the reward redemption
    // For this example, we'll just return success
    
    return {
      success: true,
      rewardId,
      pointsSpent: reward.pointsCost,
      remainingPoints: userPoints.totalPoints - reward.pointsCost,
    };
  }
}