import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserChallengeDto, CompleteChallengeDto } from '../dto/challenge.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; 
import { ChallengeService } from '../providers/challenge.service';

@ApiTags('gamification/challenges')
@Controller('gamification/challenges')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available challenges' })
  @ApiResponse({ status: 200, description: 'Challenges returned successfully', type: [UserChallengeDto] })
  async getUserChallenges(@Param('userId') userId: number): Promise<UserChallengeDto[]> {
    return this.challengeService.getUserChallenges(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete a challenge' })
  @ApiResponse({ status: 201, description: 'Challenge completed successfully' })
  async completeChallenge(@Body() completeChallengeDto: CompleteChallengeDto): Promise<any> {
    return this.challengeService.completeChallenge(completeChallengeDto);
  }
}