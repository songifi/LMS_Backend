import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StreakDto } from '../dto/streak.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; 
import { StreakService } from '../providers/streak.service';

@ApiTags('gamification/streaks')
@Controller('gamification/streaks')
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user streaks' })
  @ApiResponse({ status: 200, description: 'User streaks returned successfully', type: StreakDto })
  async getUserStreaks(@Param('userId') userId: number): Promise<StreakDto> {
    return this.streakService.getUserStreaks(userId);
  }
}