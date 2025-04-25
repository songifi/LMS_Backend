import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { QuestionBankService } from '../providers/question-bank.service';

@Controller('question-banks')
@UseGuards(JwtAuthGuard)
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @Post()
  create(@Body() createQuestionBankDto: any, @Request() req) {
    return this.questionBankService.create(createQuestionBankDto, req.user);
  }

  @Get()
  findAll(@Request() req, @Query('includeShared') includeShared: boolean) {
    return this.questionBankService.findAll(req.user.id, includeShared);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionBankService.findOne(id);
  }

  @Post(':id/questions')
  addQuestion(@Param('id') id: string, @Body() questionDto: any) {
    return this.questionBankService.addQuestion(id, questionDto);
  }

  @Delete('questions/:id')
  removeQuestion(@Param('id') id: string) {
    return this.questionBankService.removeQuestion(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateQuestionBankDto: any) {
    return this.questionBankService.update(id, updateQuestionBankDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionBankService.remove(id);
  }
}
