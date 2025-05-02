import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { Student } from './entities/student.entity';
import { StudentPreference } from './entities/student-preference.entity';
import { Enrollment } from './entities/enrollment.entity';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new student' })
  @ApiResponse({ status: 201, description: 'The student has been successfully created.', type: Student })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 409, description: 'Student with the same email already exists.' })
  create(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({ status: 200, description: 'Return all students.', type: [Student] })
  findAll(): Promise<Student[]> {
    return this.studentsService.findAll();
  }

  @Get('email')
  @ApiOperation({ summary: 'Get a student by email' })
  @ApiQuery({ name: 'email', description: 'Student email' })
  @ApiResponse({ status: 200, description: 'Return the student.', type: Student })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  findByEmail(@Query('email') email: string): Promise<Student> {
    return this.studentsService.findByEmail(email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a student by ID' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Return the student.', type: Student })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  findOne(@Param('id') id: string): Promise<Student> {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'The student has been successfully updated.', type: Student })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto): Promise<Student> {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'The student has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.studentsService.remove(id);
  }

  // Preference routes
  @Post(':id/preferences')
  @ApiOperation({ summary: 'Add a preference for a student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 201, description: 'The preference has been successfully added.', type: StudentPreference })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  addPreference(
    @Param('id') id: string,
    @Body() createPreferenceDto: CreatePreferenceDto,
  ): Promise<StudentPreference> {
    return this.studentsService.addPreference(id, createPreferenceDto);
  }

  @Get(':id/preferences')
  @ApiOperation({ summary: 'Get all preferences for a student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Return all preferences for the student.', type: [StudentPreference] })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  getPreferences(@Param('id') id: string): Promise<StudentPreference[]> {
    return this.studentsService.getPreferences(id);
  }

  @Delete(':id/preferences/:preferenceId')
  @ApiOperation({ summary: 'Remove a preference for a student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiParam({ name: 'preferenceId', description: 'Preference ID' })
  @ApiResponse({ status: 200, description: 'The preference has been successfully removed.' })
  @ApiResponse({ status: 404, description: 'Student or preference not found.' })
  removePreference(
    @Param('id') id: string,
    @Param('preferenceId') preferenceId: string,
  ): Promise<void> {
    return this.studentsService.removePreference(id, preferenceId);
  }

  // Enrollment routes
  @Get(':id/enrollments')
  @ApiOperation({ summary: 'Get all enrollments for a student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Return all enrollments for the student.', type: [Enrollment] })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  getEnrollments(@Param('id') id: string): Promise<Enrollment[]> {
    return this.studentsService.getEnrollments(id);
  }

  @Get(':id/enrollments/completed')
  @ApiOperation({ summary: 'Get completed courses for a student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Return completed courses for the student.', type: [Enrollment] })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  getCompletedCourses(@Param('id') id: string): Promise<Enrollment[]> {
    return this.studentsService.getCompletedCourses(id);
  }

  @Get(':id/enrollments/current')
  @ApiOperation({ summary: 'Get current enrollments for a student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Return current enrollments for the student.', type: [Enrollment] })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  getCurrentEnrollments(@Param('id') id: string): Promise<Enrollment[]> {
    return this.studentsService.getCurrentEnrollments(id);
  }
}