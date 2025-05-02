import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CurriculumMappingService } from './curriculum-mapping.service';
import { VisualMappingService } from './services/visual-mapping.service';
import { GapAnalysisService } from './services/gap-analysis.service';
import { AssessmentAlignmentService } from './services/assessment-alignment.service';
import { OutcomeTrackingService } from './services/outcome-tracking.service';
import { AccreditationReportService } from './services/accreditation-report.service';
import { 
  CreateMappingDto, 
  UpdateMappingDto, 
  CreateOutcomeDto,
  CreateCourseDto,
  CreateAssessmentDto,
  CreateProgramDto,
  OutcomeAchievementQueryDto,
  GapAnalysisQueryDto,
  AlignmentVerificationQueryDto,
  AccreditationReportQueryDto
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('curriculum-mapping')
@UseGuards(JwtAuthGuard)
export class CurriculumMappingController {
  constructor(
    private readonly curriculumMappingService: CurriculumMappingService,
    private readonly visualMappingService: VisualMappingService,
    private readonly gapAnalysisService: GapAnalysisService,
    private readonly assessmentAlignmentService: AssessmentAlignmentService, 
    private readonly outcomeTrackingService: OutcomeTrackingService,
    private readonly accreditationReportService: AccreditationReportService
  ) {}

  // Program endpoints
  @Post('programs')
  createProgram(@Body() createProgramDto: CreateProgramDto) {
    return this.curriculumMappingService.createProgram(createProgramDto);
  }

  @Get('programs')
  findAllPrograms() {
    return this.curriculumMappingService.findAllPrograms();
  }

  @Get('programs/:id')
  findOneProgram(@Param('id') id: string) {
    return this.curriculumMappingService.findOneProgram(id);
  }

  // Learning Outcome endpoints
  @Post('learning-outcomes')
  createLearningOutcome(@Body() createOutcomeDto: CreateOutcomeDto) {
    return this.curriculumMappingService.createLearningOutcome(createOutcomeDto);
  }

  @Get('learning-outcomes')
  findAllLearningOutcomes() {
    return this.curriculumMappingService.findAllLearningOutcomes();
  }

  // Course endpoints
  @Post('courses')
  createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.curriculumMappingService.createCourse(createCourseDto);
  }

  @Get('courses')
  findAllCourses() {
    return this.curriculumMappingService.findAllCourses();
  }

  // Assessment endpoints
  @Post('assessments')
  createAssessment(@Body() createAssessmentDto: CreateAssessmentDto) {
    return this.curriculumMappingService.createAssessment(createAssessmentDto);
  }

  @Get('assessments')
  findAllAssessments() {
    return this.curriculumMappingService.findAllAssessments();
  }

  // Mapping endpoints
  @Post('mappings')
  createMapping(@Body() createMappingDto: CreateMappingDto) {
    return this.curriculumMappingService.createMapping(createMappingDto);
  }

  @Get('mappings')
  findAllMappings() {
    return this.curriculumMappingService.findAllMappings();
  }

  @Patch('mappings/:id')
  updateMapping(@Param('id') id: string, @Body() updateMappingDto: UpdateMappingDto) {
    return this.curriculumMappingService.updateMapping(id, updateMappingDto);
  }

  @Delete('mappings/:id')
  removeMapping(@Param('id') id: string) {
    return this.curriculumMappingService.removeMapping(id);
  }

  // Visual Mapping Interface
  @Get('visual-mapping/:programId')
  getVisualMapping(@Param('programId') programId: string) {
    return this.visualMappingService.generateVisualMapping(programId);
  }

  // Gap Analysis
  @Get('gap-analysis/:programId')
  getGapAnalysis(
    @Param('programId') programId: string,
    @Query() queryParams: GapAnalysisQueryDto
  ) {
    return this.gapAnalysisService.generateGapAnalysis(programId, queryParams);
  }

  // Assessment Alignment Verification
  @Get('assessment-alignment/:programId')
  getAssessmentAlignment(
    @Param('programId') programId: string,
    @Query() queryParams: AlignmentVerificationQueryDto
  ) {
    return this.assessmentAlignmentService.verifyAssessmentAlignment(programId, queryParams);
  }

  // Learning Outcome Achievement Tracking
  @Get('outcome-achievement/:programId')
  getOutcomeAchievement(
    @Param('programId') programId: string,
    @Query() queryParams: OutcomeAchievementQueryDto
  ) {
    return this.outcomeTrackingService.trackOutcomeAchievement(programId, queryParams);
  }

  // Accreditation Report Generation
  @Get('accreditation-report/:programId')
  generateAccreditationReport(
    @Param('programId') programId: string,
    @Query() queryParams: AccreditationReportQueryDto
  ) {
    return this.accreditationReportService.generateAccreditationReport(programId, queryParams);
  }
}