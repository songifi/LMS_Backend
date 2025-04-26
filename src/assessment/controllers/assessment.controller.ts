import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, Query } from '@nestjs/common';
import { CreateAssessmentDto } from '../dto/create-assessment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AssessmentService } from '../providers/assessment.service';

@Controller('assessments')
@UseGuards(JwtAuthGuard)
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post()
  create(@Body() createAssessmentDto: CreateAssessmentDto, @Request() req) {
    return this.assessmentService.create(createAssessmentDto, req.user);
  }

  @Get()
  findAll(@Query() query) {
    return this.assessmentService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assessmentService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAssessmentDto: any) {
    return this.assessmentService.update(id, updateAssessmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assessmentService.remove(id);
  }

  @Get(':id/analytics')
  getAnalytics(@Param('id') id: string) {
    return this.assessmentService.getAnalytics(id);
  }
}
