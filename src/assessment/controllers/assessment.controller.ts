import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, Query } from "@nestjs/common"
import { CreateAssessmentDto } from "../dto/create-assessment.dto"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { AssessmentService } from "../providers/assessment.service"
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger"

@ApiTags("assessment")
@Controller("assessments")
@UseGuards(JwtAuthGuard)
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post()
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Create a new assessment" })
  @ApiCreatedResponse({ description: "Assessment created successfully" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  create(@Body() createAssessmentDto: CreateAssessmentDto, @Request() req) {
    return this.assessmentService.create(createAssessmentDto, req.user)
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all assessments with filtering' })
  @ApiOkResponse({ description: 'List of assessments' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  findAll(@Query() query) {
    return this.assessmentService.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get assessment by ID' })
  @ApiParam({ name: 'id', description: 'Assessment ID' })
  @ApiOkResponse({ description: 'Assessment details' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiNotFoundResponse({ description: 'Assessment not found' })
  findOne(@Param('id') id: string) {
    return this.assessmentService.findOne(id);
  }

  @Put(":id")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update assessment" })
  @ApiParam({ name: "id", description: "Assessment ID" })
  @ApiOkResponse({ description: "Assessment updated successfully" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiNotFoundResponse({ description: "Assessment not found" })
  update(@Param('id') id: string, @Body() updateAssessmentDto: any) {
    return this.assessmentService.update(id, updateAssessmentDto)
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete assessment' })
  @ApiParam({ name: 'id', description: 'Assessment ID' })
  @ApiNoContentResponse({ description: 'Assessment deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiNotFoundResponse({ description: 'Assessment not found' })
  remove(@Param('id') id: string) {
    return this.assessmentService.remove(id);
  }

  @Get(':id/analytics')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get assessment analytics' })
  @ApiParam({ name: 'id', description: 'Assessment ID' })
  @ApiOkResponse({ description: 'Assessment analytics data' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiNotFoundResponse({ description: 'Assessment not found' })
  getAnalytics(@Param('id') id: string) {
    return this.assessmentService.getAnalytics(id);
  }
}
