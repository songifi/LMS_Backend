import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MilestoneService } from './milestone.service';

@ApiTags('Milestones')
@Controller('milestones')
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  @Get()
  @ApiOperation({ summary: 'Get student milestones' })
  getMilestones() {
    return this.milestoneService.getMilestones();
  }
}
