import { Controller, Get, Post, Body, Param, Patch, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { CreateTemplateVersionDto } from '../dto/create-template-version.dto';
import { TemplateVersionService } from '../providers/template-version.service';

@Controller('template-versions')
export class TemplateVersionController {
  constructor(private readonly templateVersionService: TemplateVersionService) {}

  @Post()
  create(@Body() createDto: CreateTemplateVersionDto) {
    return this.templateVersionService.create(createDto);
  }

  @Get()
  findAll() {
    return this.templateVersionService.findAll();
  }

  @Get('template/:templateId')
  findByTemplateId(@Param('templateId', ParseUUIDPipe) templateId: string) {
    return this.templateVersionService.findByTemplateId(templateId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.templateVersionService.findOne(id);
  }

  @Patch(':id/activate')
  setActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.templateVersionService.setActive(id);
  }
}
