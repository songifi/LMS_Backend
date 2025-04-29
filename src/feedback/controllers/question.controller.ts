import { Controller, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { Question } from '../entities/question.entity';
import { QuestionService } from '../providers/question.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('questions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post('survey/:surveyId')
  @ApiOperation({ summary: 'Add a question to a survey' })
  @ApiParam({ name: 'surveyId', description: 'Survey ID' })
  @ApiResponse({ status: 201, description: 'The question has been added', type: Question })
  addQuestionToSurvey(
    @Param('surveyId') surveyId: string,
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    return this.questionService.addQuestionToSurvey(surveyId, createQuestionDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a question' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'The question has been updated', type: Question })
  updateQuestion(
    @Param('id') id: string,
    @Body() updateQuestionDto: Partial<CreateQuestionDto>,
  ): Promise<Question> {
    return this.questionService.updateQuestion(id, updateQuestionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a question' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'The question has been removed' })
  removeQuestion(@Param('id') id: string): Promise<void> {
    return this.questionService.removeQuestion(id);
  }

  @Put('survey/:surveyId/reorder')
  @ApiOperation({ summary: 'Reorder questions in a survey' })
  @ApiParam({ name: 'surveyId', description: 'Survey ID' })
  @ApiResponse({ status: 200, description: 'Questions have been reordered' })
  reorderQuestions(
    @Param('surveyId') surveyId: string,
    @Body() body: { questionIds: string[] },
  ): Promise<void> {
    return this.questionService.reorderQuestions(surveyId, body.questionIds);
  }
}
