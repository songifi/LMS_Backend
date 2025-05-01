import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { CreateLearningOutcomeDto } from '../dto/create-learning-outcome.dto';
import { LearningOutcomeService } from '../providers/learning-outcome.service';

@Controller('learning-outcomes')
export class LearningOutcomeController {
  constructor(private readonly learningOutcomeService: LearningOutcomeService) {}

  @Post()
  create(@Body() createDto: CreateLearningOutcomeDto) {
    return this.learningOutcomeService.create(createDto);
  }

  @Get('template/:templateId')
  findByTemplateId(@Param('templateId', ParseUUIDPipe) templateId: string) {
    return this.learningOutcomeService.findByTemplateId(templateId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.learningOutcomeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: Partial<CreateLearningOutcomeDto>,
  ) {
    return this.learningOutcomeService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.learningOutcomeService.remove(id);
  }
}
