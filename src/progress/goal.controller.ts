import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GoalService } from './goal.service';

@ApiTags('Goals')
@Controller('goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new goal' })
  createGoal(@Body() createGoalDto: any) {
    return this.goalService.createGoal(createGoalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get student goals' })
  getGoals() {
    return this.goalService.getGoals();
  }
}
