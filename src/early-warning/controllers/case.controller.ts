import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateCaseDto, UpdateCaseDto } from '../dtos/case.dto';
import { Case } from '../entities/case.entity';
import { CaseManagementService } from '../services/case-management.service';
import { PrivacyService } from '../services/privacy.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@ApiTags('cases')
@Controller('cases')
@UseGuards(PrivacyService)
export class CaseController {
  constructor(
    @InjectModel(Case.name) private readonly caseModel: Model<Case>,
    private readonly caseManagementService: CaseManagementService,
    private readonly privacyService: PrivacyService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new case' })
  async create(@Body() createCaseDto: CreateCaseDto, @Req() req: any): Promise<Case> {
    return this.caseManagementService.createCase(createCaseDto, req.user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cases' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'assignedTo', required: false })
  @ApiQuery({ name: 'priority', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('studentId') studentId?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('priority') priority?: string,
    @Req() req: any,
  ): Promise<Case[]> {
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (studentId) {
      query.student = studentId;
    }
    
    if (assignedTo) {
      query.assignedTo = assignedTo;
    } else if (req.user && !req.user.roles.includes('admin')) {
      // If not admin and no specific assignee requested, show only cases assigned to user
      query.assignedTo = req.user.id;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    const cases = await this.caseModel.find(query)
      .populate('student', 'firstName lastName studentId')
      .populate('assignedTo', 'firstName lastName')
      .populate('triggeringIndicators', 'name riskLevel')
      .populate('recommendedInterventions', 'name type')
      .populate('appliedInterventions', 'name type')
      .exec();
    
    // Apply privacy filters based on user's roles and permissions
    return this.privacyService.applyPrivacyFilters(cases, req.user, 'cases');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a case by id' })
  @ApiParam({ name: 'id', description: 'Case ID' })
  async findOne(@Param('id') id: string, @Req() req: any): Promise<Case> {
    const caseData = await this.caseModel.findById(id)
      .populate('student', 'firstName lastName studentId metrics riskScores overallRiskLevel')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('triggeringIndicators', 'name description dataSource riskLevel')
      .populate('recommendedInterventions', 'name description type method')
      .populate('appliedInterventions', 'name description type method')
      .exec();
    
    // Apply privacy filters
    return this.privacyService.applyPrivacyFilters(caseData, req.user, 'cases');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a case' })
  @ApiParam({ name: 'id', description: 'Case ID' })
  async update(
    @Param('id') id: string,
    @Body() updateCaseDto: UpdateCaseDto,
    @Req() req: any,
  ): Promise<Case> {
    return this.caseManagementService.updateCase(id, updateCaseDto, req.user?.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a case' })
  @ApiParam({ name: 'id', description: 'Case ID' })
  async remove(@Param('id') id: string): Promise<Case> {
    const caseData = await this.caseModel.findById(id).exec();
    
    // Update student's case list
    if (caseData) {
      await this.caseModel.updateOne(
        { _id: caseData.student },
        { $pull: { cases: id } }
      );
    }
    
    return this.caseModel.findByIdAndRemove(id).exec();
  }
}