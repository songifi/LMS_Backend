import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AchievementService } from './achievement.service';

@ApiTags('Achievements')
@Controller('achievements')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Get()
  @ApiOperation({ summary: 'Get student achievements' })
  getAchievements() {
    return this.achievementService.getAchievements();
  }
}
