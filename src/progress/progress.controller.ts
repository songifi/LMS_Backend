import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Get student progress overview' })
  getOverview() {
    return this.progressService.getProgressOverview();
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get course progress' })
  getCourseProgress() {
    return this.progressService.getCourseProgress();
  }

  @Get('programs')
  @ApiOperation({ summary: 'Get program progress' })
  getProgramProgress() {
    return this.progressService.getProgramProgress();
  }
}
