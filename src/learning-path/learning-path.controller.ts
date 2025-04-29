import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { LearningPathService } from './learning-path.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';

@ApiTags('Learning Paths')
@Controller('learning-paths')
export class LearningPathController {
  constructor(private readonly service: LearningPathService) {}

  @Get()
  @ApiOperation({ summary: 'Get all learning paths' })
  @ApiResponse({ status: 200, description: 'List of learning paths' })
  getAll() {
    return this.service.getAllLearningPaths();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new learning path' })
  @ApiResponse({ status: 201, description: 'Learning path created' })
  create(@Body() dto: CreateLearningPathDto) {
    return this.service.createLearningPath(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get learning path details' })
  @ApiParam({ name: 'id', description: 'Learning path ID' })
  getOne(@Param('id') id: string) {
    return this.service.getLearningPathById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a learning path' })
  update(@Param('id') id: string, @Body() dto: UpdateLearningPathDto) {
    return this.service.updateLearningPath(id, dto);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get learner progress' })
  @ApiQuery({ name: 'learnerId', required: true })
  getProgress(@Param('id') id: string, @Query('learnerId') learnerId: string) {
    return this.service.getLearnerProgress(id, learnerId);
  }

  @Post(':id/assessments')
  @ApiOperation({ summary: 'Submit an assessment' })
  submitAssessment(@Param('id') id: string, @Body() dto: SubmitAssessmentDto) {
    return this.service.submitAssessment(id, dto);
  }

  @Get(':id/recommendations')
  @ApiOperation({ summary: 'Get content recommendations' })
  @ApiQuery({ name: 'learnerId', required: true })
  getRecommendations(@Param('id') id: string, @Query('learnerId') learnerId: string) {
    return this.service.getRecommendations(learnerId);
  }
}