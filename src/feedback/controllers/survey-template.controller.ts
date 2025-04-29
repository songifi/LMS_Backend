import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateSurveyTemplateDto } from '../dto/create-survey-template.dto';
import { SurveyTemplate } from '../entities/survey-template.entity';
import { Survey } from '../entities/survey.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SurveyTemplateService } from '../providers/survey-template.service';

@ApiTags('survey-templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('survey-templates')
export class SurveyTemplateController {
  constructor(private readonly surveyTemplateService: SurveyTemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new survey template' })
  @ApiResponse({ status: 201, description: 'The survey template has been created', type: SurveyTemplate })
  create(@Body() createSurveyTemplateDto: CreateSurveyTemplateDto): Promise<SurveyTemplate> {
    return this.surveyTemplateService.create(createSurveyTemplateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all survey templates' })
  @ApiResponse({ status: 200, description: 'Return all survey templates', type: [SurveyTemplate] })
  findAll(): Promise<SurveyTemplate[]> {
    return this.surveyTemplateService.findAll();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get survey templates by category' })
  @ApiParam({ name: 'category', description: 'Template category' })
  @ApiResponse({ status: 200, description: 'Return survey templates by category', type: [SurveyTemplate] })
  findByCategory(@Param('category') category: string): Promise<SurveyTemplate[]> {
    return this.surveyTemplateService.findByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific survey template' })
  @ApiParam({ name: 'id', description: 'Survey Template ID' })
  @ApiResponse({ status: 200, description: 'Return the survey template', type: SurveyTemplate })
  findOne(@Param('id') id: string): Promise<SurveyTemplate> {
    return this.surveyTemplateService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a survey template' })
  @ApiParam({ name: 'id', description: 'Survey Template ID' })
  @ApiResponse({ status: 200, description: 'The survey template has been updated', type: SurveyTemplate })
  update(
    @Param('id') id: string,
    @Body() updateSurveyTemplateDto: Partial<CreateSurveyTemplateDto>,
  ): Promise<SurveyTemplate> {
    return this.surveyTemplateService.update(id, updateSurveyTemplateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a survey template' })
  @ApiParam({ name: 'id', description: 'Survey Template ID' })
  @ApiResponse({ status: 200, description: 'The survey template has been deleted' })
  remove(@Param('id') id: string): Promise<void> {
    return this.surveyTemplateService.remove(id);
  }

  @Post(':id/create-survey')
  @ApiOperation({ summary: 'Create a survey from template' })
  @ApiParam({ name: 'id', description: 'Survey Template ID' })
  @ApiResponse({ status: 201, description: 'A survey has been created from the template', type: Survey })
  createSurveyFromTemplate(
    @Param('id') id: string,
    @Body() customizations: Record<string, any> = {},
  ): Promise<Survey> {
    return this.surveyTemplateService.createSurveyFromTemplate(id, customizations);
  }
}