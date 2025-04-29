import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LeaderboardDto } from '../dto/leaderboard.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LeaderboardService } from '../providers/leaderboard.service';

@ApiTags('gamification/leaderboards')
@Controller('gamification/leaderboards')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get leaderboards' })
  @ApiResponse({ status: 200, description: 'Leaderboards returned successfully', type: [LeaderboardDto] })
  async getLeaderboards(): Promise<LeaderboardDto[]> {
    return this.leaderboardService.getLeaderboards();
  }
}