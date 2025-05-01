import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { CreateAssessmentStructureDto } from '../dto/create-assessment-structure.dto';
import { AssessmentStructureService } from '../providers/assessment-structure.service';

@Controller('assessment-structures')
export class AssessmentStructureController {
  constructor(private readonly assessmentStructureService: AssessmentStructureService) {}

  @Post()
  create(@Body() createDto: CreateAssessmentStructureDto) {
    return this.assessmentStructureService.create(createDto);
  }

  @Get('template/:templateId')
  findByTemplateId(@Param('templateId', ParseUUIDPipe) templateId: string) {
    return this.assessmentStructureService.findByTemplateId(templateId);
  }

  @Get('template/:templateId/validate-weight')
  validateTotalWeight(@Param('templateId', ParseUUIDPipe) templateId: string) {
    return this.assessmentStructureService.validateTotalWeight(templateId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.assessmentStructureService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: Partial<CreateAssessmentStructureDto>,
  ) {
    return this.assessmentStructureService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.assessmentStructureService.remove(id);
  }
}
