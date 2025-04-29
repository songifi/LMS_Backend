import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRewardDto } from '../dto/reward.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Adjust the import path as necessary
import { RewardService } from '../providers/reward.service';

@ApiTags('gamification/rewards')
@Controller('gamification/rewards')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available rewards' })
  @ApiResponse({ status: 200, description: 'Rewards returned successfully', type: [UserRewardDto] })
  async getUserRewards(@Param('userId') userId: number): Promise<UserRewardDto[]> {
    return this.rewardService.getUserRewards(userId);
  }

  @Post(':rewardId/redeem')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Redeem a reward' })
  @ApiResponse({ status: 201, description: 'Reward redeemed successfully' })
  async redeemReward(
    @Param('userId') userId: number,
    @Param('rewardId') rewardId: number,
  ): Promise<any> {
    return this.rewardService.redeemReward(userId, rewardId);
  }
}
