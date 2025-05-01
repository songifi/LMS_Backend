import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DegreeAuditService } from './degree-audit.service';
import { CreateDegreeProgramDto } from './dto/create-degree-program.dto';
import { CreateDegreeRequirementDto } from './dto/create-degree-requirement.dto';
import { DegreeProgram } from './entities/degree-program.entity';
import { DegreeRequirement } from './entities/degree-requirement.entity';

@ApiTags('degree-audit')
@Controller('degree-audit')
export class DegreeAuditController {
  constructor(private readonly degreeAuditService: DegreeAuditService) {}

  @Post('programs')
  @ApiOperation({ summary: 'Create a new degree program' })
  @ApiResponse({ status: 201, description: 'The degree program has been successfully created.', type: DegreeProgram })
  createDegreeProgram(@Body() createDegreeProgramDto: CreateDegreeProgramDto): Promise<DegreeProgram> {
    return this.degreeAuditService.createDegreeProgram(createDegreeProgramDto);
  }

  @Get('programs')
  @ApiOperation({ summary: 'Get all degree programs' })
  @ApiResponse({ status: 200, description: 'Return all degree programs.', type: [DegreeProgram] })
  findAllDegreePrograms(): Promise<DegreeProgram[]> {
    return this.degreeAuditService.findAllDegreePrograms();
  }

  @Get('programs/:id')
  @ApiOperation({ summary: 'Get a degree program by ID' })
  @ApiParam({ name: 'id', description: 'Degree Program ID' })
  @ApiResponse({ status: 200, description: 'Return the degree program.', type: DegreeProgram })
  findDegreeProgram(@Param('id') id: string): Promise<DegreeProgram> {
    return this.degreeAuditService.findDegreeProgram(id);
  }

  @Post('programs/:id/requirements')
  @ApiOperation({ summary: 'Add a requirement to a degree program' })
  @ApiParam({ name: 'id', description: 'Degree Program ID' })
  @ApiResponse({ status: 201, description: 'The requirement has been successfully added.', type: DegreeRequirement })
  addRequirement(
    @Param('id') id: string,
    @Body() createRequirementDto: CreateDegreeRequirementDto,
  ): Promise<DegreeRequirement> {
    return this.degreeAuditService.addRequirement(id, createRequirementDto);
  }

  @Get('programs/:id/requirements')
  @ApiOperation({ summary: 'Get all requirements for a degree program' })
  @ApiParam({ name: 'id', description: 'Degree Program ID' })
  @ApiResponse({ status: 200, description: 'Return all requirements for the degree program.', type: [DegreeRequirement] })
  findRequirements(@Param('id') id: string): Promise<DegreeRequirement[]> {
    return this.degreeAuditService.findRequirements(id);
  }

  @Get('requirements/:id')
  @ApiOperation({ summary: 'Get a requirement by ID' })
  @ApiParam({ name: 'id', description: 'Requirement ID' })
  @ApiResponse({ status: 200, description: 'Return the requirement.', type: DegreeRequirement })
  findRequirement(@Param('id') id: string): Promise<DegreeRequirement> {
    return this.degreeAuditService.findRequirement(id);
  }

  @Get('audit')
  @ApiOperation({ summary: 'Audit a student\'s progress towards a degree' })
  @ApiResponse({ status: 200, description: 'Return the audit results.' })
  auditStudentProgress(
    @Query('studentId') studentId: string,
    @Query('programId') programId: string,
  ): Promise<any> {
    return this.degreeAuditService.auditStudentProgress(studentId, programId);
  }
}