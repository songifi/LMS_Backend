import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { Curriculum } from '../entities/curriculum.entity';
import { Requirement } from '../entities/requirement.entity';
import { ProgramEnrollment } from '../entities/program-enrollment.entity';
import { CreateCurriculumDto } from '../dto/create-curriculum.dto';
import { CreateRequirementDto } from '../dto/create-requirement.dto';
import { CreateProgramEnrollmentDto } from '../dto/create-program-enrollment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ProgramService } from '../providers/academic-program.service';
import { Program } from '../entities/academic-program.entity';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { CreateProgramDto } from '../dto/create-academic-program.dto';
import { UpdateProgramDto } from '../dto/update-academic-program.dto';
import { RoleEnum } from 'src/user/role.enum';

@ApiBearerAuth()
@ApiTags('academic-programs')
@Controller('programs')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @ApiOperation({ summary: 'Get all academic programs' })
  @ApiResponse({ status: 200, description: 'Return all programs', type: [Program] })
  @Get()
  findAll(): Promise<Program[]> {
    return this.programService.findAllPrograms();
  }

  @ApiOperation({ summary: 'Create a new academic program' })
  @ApiResponse({ status: 201, description: 'Program created successfully', type: Program })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.PROGRAM_MANAGER)
  @Post()
  create(@Body() createProgramDto: CreateProgramDto): Promise<Program> {
    return this.programService.createProgram(createProgramDto);
  }

  @ApiOperation({ summary: 'Get a program by ID' })
  @ApiResponse({ status: 200, description: 'Return the program', type: Program })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Program> {
    return this.programService.findProgramById(id);
  }

  @ApiOperation({ summary: 'Update a program' })
  @ApiResponse({ status: 200, description: 'Program updated successfully', type: Program })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.PROGRAM_MANAGER)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateProgramDto: UpdateProgramDto,
  ): Promise<Program> {
    return this.programService.updateProgram(id, updateProgramDto);
  }

  @ApiOperation({ summary: 'Delete a program' })
  @ApiResponse({ status: 200, description: 'Program deleted successfully' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.programService.deleteProgram(id);
  }

  @ApiOperation({ summary: 'Get program curriculum' })
  @ApiResponse({ status: 200, description: 'Return program curriculum', type: [Curriculum] })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @Get(':id/curriculum')
  findCurriculum(@Param('id') id: string): Promise<Curriculum[]> {
    return this.programService.findProgramCurricula(id);
  }

  @ApiOperation({ summary: 'Create program curriculum' })
  @ApiResponse({ status: 201, description: 'Curriculum created successfully', type: Curriculum })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.PROGRAM_MANAGER)
  @Post(':id/curriculum')
  createCurriculum(
    @Param('id') id: string,
    @Body() createCurriculumDto: CreateCurriculumDto,
  ): Promise<Curriculum> {
    createCurriculumDto.programId = id;
    return this.programService.createCurriculum(createCurriculumDto);
  }

  @ApiOperation({ summary: 'Get program requirements' })
  @ApiResponse({ status: 200, description: 'Return program requirements', type: [Requirement] })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @Get(':id/requirements')
  findRequirements(@Param('id') id: string): Promise<Requirement[]> {
    return this.programService.findProgramRequirements(id);
  }

  @ApiOperation({ summary: 'Create program requirement' })
  @ApiResponse({ status: 201, description: 'Requirement created successfully', type: Requirement })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.PROGRAM_MANAGER)
  @Post(':id/requirements')
  createRequirement(
    @Param('id') id: string,
    @Body() createRequirementDto: CreateRequirementDto,
  ): Promise<Requirement> {
    createRequirementDto.programId = id;
    return this.programService.createRequirement(createRequirementDto);
  }

  @ApiOperation({ summary: 'Get program enrollments' })
  @ApiResponse({ status: 200, description: 'Return program enrollments', type: [ProgramEnrollment] })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiParam({ name: 'id', description: 'Program ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.PROGRAM_MANAGER, RoleEnum.ACADEMIC_ADVISOR)
  @Get(':id/enrollments')
  findEnrollments(@Param('id') id: string): Promise<ProgramEnrollment[]> {
    return this.programService.findProgramEnrollments(id);
  }

  @ApiOperation({ summary: 'Create program enrollment' })
  @ApiResponse({ status: 201, description: 'Enrollment created successfully', type: ProgramEnrollment })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.PROGRAM_MANAGER, RoleEnum.ACADEMIC_ADVISOR)
  @Post(':id/enrollments')
  createEnrollment(
    @Param('id') id: string,
    @Body() createEnrollmentDto: CreateProgramEnrollmentDto,
  ): Promise<ProgramEnrollment> {
    createEnrollmentDto.programId = id;
    return this.programService.createProgramEnrollment(createEnrollmentDto);
  }
}