import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserBadgesResponseDto } from '../dto/badge.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Adjust the import path as necessary
import { BadgeService } from '../providers/badge.service';

@ApiTags('gamification/badges')
@Controller('gamification/badges')
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user badges' })
  @ApiResponse({ status: 200, description: 'User badges returned successfully', type: UserBadgesResponseDto })
  async getUserBadges(@Param('userId') userId: number): Promise<UserBadgesResponseDto> {
    return this.badgeService.getUserBadges(userId);
  }
}
