import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateStudentDto, UpdateStudentDto } from '../dtos/student.dto';
import { Student } from '../entities/student.entity';
import { RiskAssessmentService } from '../services/risk-assessment.service';
import { PrivacyService } from '../services/privacy.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@ApiTags('students')
@Controller('students')
@UseGuards(PrivacyService)
export class StudentController {
  constructor(
    @InjectModel(Student.name) private readonly studentModel: Model<Student>,
    private readonly riskAssessmentService: RiskAssessmentService,
    private readonly privacyService: PrivacyService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new student' })
  async create(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
    const createdStudent = new this.studentModel(createStudentDto);
    return createdStudent.save();
  }

  @Get()
  @ApiOperation({ summary: 'Get all students' })
  @ApiQuery({ name: 'classGroup', required: false })
  @ApiQuery({ name: 'riskLevel', required: false })
  @ApiQuery({ name: 'hasActiveIntervention', required: false, type: Boolean })
  async findAll(
    @Query('classGroup') classGroup?: string,
    @Query('riskLevel') riskLevel?: string,
    @Query('hasActiveIntervention') hasActiveIntervention?: boolean,
    @Req() req: any,
  ): Promise<Student[]> {
    const query: any = {};
    
    if (classGroup) {
      query.classGroup = classGroup;
    } else if (req.user?.classGroups?.length) {
      // Filter by user's assigned class groups if no specific group requested
      query.classGroup = { $in: req.user.classGroups };
    }
    
    if (riskLevel) {
      query.overallRiskLevel = riskLevel;
    }
    
    if (hasActiveIntervention !== undefined) {
      query.hasActiveIntervention = hasActiveIntervention;
    }
    
    const students = await this.studentModel.find(query)
      .select('firstName lastName studentId grade classGroup overallRiskLevel hasActiveIntervention')
      .exec();
    
    // Apply privacy filters
    return this.privacyService.applyPrivacyFilters(students, req.user, 'default');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a student by id' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiQuery({ name: 'includeCases', required: false, type: Boolean })
  async findOne(
    @Param('id') id: string,
    @Query('includeCases') includeCases?: boolean,
    @Req() req: any,
  ): Promise<Student> {
    const query = this.studentModel.findById(id);
    
    if (includeCases) {
      query.populate({
        path: 'cases',
        select: 'title status priority createdAt updatedAt',
        options: { sort: { updatedAt: -1 } },
      });
    }
    
    const student = await query.exec();
    
    // Apply privacy filters
    return this.privacyService.applyPrivacyFilters(student, req.user, 'default');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    return this.studentModel
      .findByIdAndUpdate(id, updateStudentDto, { new: true })
      .exec();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  async remove(@Param('id') id: string): Promise<Student> {
    return this.studentModel.findByIdAndRemove(id).exec();
  }

  @Post(':id/assess-risk')
  @ApiOperation({ summary: 'Assess risk for a student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  async assessRisk(@Param('id') id: string): Promise<any> {
    return this.riskAssessmentService.assessStudentRisk(id);
  }
}