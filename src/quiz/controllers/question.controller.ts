import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, BadRequestException, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuestionService } from '../services/question.service';
import { CreateQuestionDto } from '../dtos/create-question.dto';
import { UpdateQuestionDto } from '../dtos/update-question.dto';
import { QuestionFilterDto } from '../dtos/question-filter.dto';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionService.create(createQuestionDto);
  }

  @Get()
  findAll(@Query() filterDto: QuestionFilterDto) {
    return this.questionService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    return this.questionService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionService.remove(id);
  }

  @Get(':id/versions')
  getVersions(@Param('id') id: string) {
    return this.questionService.getVersionHistory(id);
  }

  @Get(':id/versions/:versionNumber')
  getVersion(@Param('id') id: string, @Param('versionNumber') versionNumber: number) {
    return this.questionService.getVersion(id, versionNumber);
  }

  @Post(':id/restore/:versionNumber')
  restoreVersion(@Param('id') id: string, @Param('versionNumber') versionNumber: number) {
    return this.questionService.restoreVersion(id, versionNumber);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.questionService.duplicate(id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.questionService.importQuestions(file.buffer);
  }

  @Get('export/batch')
  export(@Query('ids') ids: string) {
    if (!ids) {
      throw new BadRequestException('No question IDs provided');
    }
    const questionIds = ids.split(',');
    return this.questionService.exportQuestions(questionIds);
  }

  @Get(':id/analytics')
  getAnalytics(@Param('id') id: string) {
    return this.questionService.getQuestionAnalytics(id);
  }

  @Post(':id/tags/:tagId')
  addTag(@Param('id') id: string, @Param('tagId') tagId: string) {
    return this.questionService.addTag(id, tagId);
  }

  @Delete(':id/tags/:tagId')
  removeTag(@Param('id') id: string, @Param('tagId') tagId: string) {
    return this.questionService.removeTag(id, tagId);
  }

  @Post(':id/categories/:categoryId')
  addCategory(@Param('id') id: string, @Param('categoryId') categoryId: string) {
    return this.questionService.addCategory(id, categoryId);
  }

  @Delete(':id/categories/:categoryId')
  removeCategory(@Param('id') id: string, @Param('categoryId') categoryId: string) {
    return this.questionService.removeCategory(id, categoryId);
  }
}