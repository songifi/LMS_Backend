import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpStatus, 
  HttpCode, 
  BadRequestException,
  ParseUUIDPipe
} from '@nestjs/common';
import { CreateCourseTemplateDto } from '../dto/create-course-template.dto';
import { UpdateCourseTemplateDto } from '../dto/update-course-template.dto';
import { ApplyTemplateDto } from '../dto/apply-template.dto';
import { CourseTemplateService } from '../providers/course-templates.service';
import { ImportTemplateDto } from '../dto/mport-template.dto';

@Controller('course-templates')
export class CourseTemplateController {
  constructor(private readonly courseTemplateService: CourseTemplateService) {}

  @Post()
  create(@Body() createCourseTemplateDto: CreateCourseTemplateDto) {
    return this.courseTemplateService.create(createCourseTemplateDto);
  }

  @Get()
  findAll() {
    return this.courseTemplateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.courseTemplateService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourseTemplateDto: UpdateCourseTemplateDto,
  ) {
    return this.courseTemplateService.update(id, updateCourseTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.courseTemplateService.remove(id);
  }

  @Post(':parentId/extend')
  extendTemplate(
    @Param('parentId', ParseUUIDPipe) parentId: string,
    @Body() createCourseTemplateDto: CreateCourseTemplateDto,
  ) {
    return this.courseTemplateService.extendTemplate(parentId, createCourseTemplateDto);
  }

  @Get(':id/export')
  exportTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return this.courseTemplateService.exportTemplate(id);
  }

  @Post('import')
  importTemplate(@Body() importDto: ImportTemplateDto) {
    return this.courseTemplateService.importTemplate(importDto);
  }

  @Post('apply')
  @HttpCode(HttpStatus.OK)
  applyTemplate(@Body() applyDto: ApplyTemplateDto) {
    return this.courseTemplateService.applyToCourses(applyDto);
  }
}
