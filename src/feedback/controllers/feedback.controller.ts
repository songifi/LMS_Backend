import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateFeedbackDto } from '../dto/create-feedback.dto';
import { UpdateFeedbackDto } from '../dto/update-feedback.dto';
import { FeedbackService } from '../providers/feedback.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('feedback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Create new feedback' })
  @ApiResponse({ status: 201, description: 'The feedback has been created' })
  create(@Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.create(createFeedbackDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all feedback' })
  @ApiResponse({ status: 200, description: 'Return all feedback' })
  findAll() {
    return this.feedbackService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific feedback' })
  @ApiParam({ name: 'id', description: 'Feedback ID' })
  @ApiResponse({ status: 200, description: 'Return the feedback' })
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update feedback' })
  @ApiParam({ name: 'id', description: 'Feedback ID' })
  @ApiResponse({ status: 200, description: 'The feedback has been updated' })
  update(@Param('id') id: string, @Body() updateFeedbackDto: UpdateFeedbackDto) {
    return this.feedbackService.update(+id, updateFeedbackDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete feedback' })
  @ApiParam({ name: 'id', description: 'Feedback ID' })
  @ApiResponse({ status: 200, description: 'The feedback has been deleted' })
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(+id);
  }
}
