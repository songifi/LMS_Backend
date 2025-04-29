import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PointDto, UserPointsDto } from '../dto/point.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Adjust the import path as necessary
import { PointService } from '../providers/point.service';

@ApiTags('gamification/points')
@Controller('gamification/points')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user points' })
  @ApiResponse({ status: 200, description: 'User points returned successfully', type: UserPointsDto })
  async getUserPoints(@Param('userId') userId: number): Promise<UserPointsDto> {
    return this.pointService.getUserPoints(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Award points to a user' })
  @ApiResponse({ status: 201, description: 'Points awarded successfully' })
  async awardPoints(@Body() pointDto: PointDto): Promise<any> {
    const point = await this.pointService.awardPoints(pointDto);
    return { success: true, pointId: point.id, amount: point.amount };
  }
}
