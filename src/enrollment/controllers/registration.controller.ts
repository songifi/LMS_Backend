import { Controller, Get, Post, Body, Param, Delete, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import { CreateRegistrationDto } from "../dto/create-registration.dto"
import { Registration } from "../entities/registration.entity"
import { RegistrationHistory } from "../entities/registration-history.entity"
import { RegistrationService } from "../providers/registration.service"
import { RegistrationStatus } from "../enums/registrationStatus.enum"

@ApiTags("registrations")
@Controller("registrations")
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  @ApiOperation({ summary: 'Register for courses' })
  @ApiResponse({ status: 201, description: 'The registration has been successfully created.', type: Registration })
  @ApiResponse({ status: 400, description: 'Invalid input data or registration not allowed.' })
  @ApiResponse({ status: 409, description: 'Student is already registered for this course.' })
  @Post()
  create(@Body() createRegistrationDto: CreateRegistrationDto): Promise<Registration> {
    return this.registrationService.create(createRegistrationDto);
  }

  @Get()
  @ApiOperation({ summary: "Get student registrations" })
  @ApiQuery({ name: "studentId", required: false, description: "Filter by student ID" })
  @ApiQuery({ name: "courseId", required: false, description: "Filter by course ID" })
  @ApiQuery({ name: "semesterId", required: false, description: "Filter by semester ID" })
  @ApiResponse({ status: 200, description: "Return all registrations matching the criteria.", type: [Registration] })
  findAll(
    @Query('studentId') studentId?: string,
    @Query('courseId') courseId?: string,
    @Query('semesterId') semesterId?: string,
  ): Promise<Registration[]> {
    const filters: Partial<Registration> = {}
    if (studentId) filters.studentId = studentId
    if (courseId) filters.courseId = courseId
    if (semesterId) filters.semesterId = semesterId

    return this.registrationService.findAll(filters)
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get registrations for a specific student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Return all registrations for the student.', type: [Registration] })
  findByStudent(@Param('studentId') studentId: string): Promise<Registration[]> {
    return this.registrationService.findByStudent(studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get registration by id' })
  @ApiParam({ name: 'id', description: 'Registration ID' })
  @ApiResponse({ status: 200, description: 'Return the registration.', type: Registration })
  @ApiResponse({ status: 404, description: 'Registration not found.' })
  findOne(@Param('id') id: string): Promise<Registration> {
    return this.registrationService.findOne(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get registration history' })
  @ApiParam({ name: 'id', description: 'Registration ID' })
  @ApiResponse({ status: 200, description: 'Return the registration history.', type: [RegistrationHistory] })
  @ApiResponse({ status: 404, description: 'Registration not found.' })
  getHistory(@Param('id') id: string): Promise<RegistrationHistory[]> {
    return this.registrationService.getRegistrationHistory(id);
  }

  @Post(":id/status")
  @ApiOperation({ summary: "Update registration status" })
  @ApiParam({ name: "id", description: "Registration ID" })
  @ApiResponse({
    status: 200,
    description: "The registration status has been successfully updated.",
    type: Registration,
  })
  @ApiResponse({ status: 404, description: "Registration not found." })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: RegistrationStatus; userId: string; reason: string },
  ): Promise<Registration> {
    return this.registrationService.updateStatus(id, body.status, body.userId, body.reason)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Drop registration" })
  @ApiParam({ name: "id", description: "Registration ID" })
  @ApiResponse({ status: 200, description: "The registration has been successfully dropped." })
  @ApiResponse({ status: 404, description: "Registration not found." })
  remove(@Param('id') id: string, @Body() body: { userId: string; reason: string }): Promise<void> {
    return this.registrationService.remove(id, body.userId, body.reason)
  }

  @Post(':id/verify-prerequisites')
  @ApiOperation({ summary: 'Verify and update prerequisites for a registration' })
  @ApiParam({ name: 'id', description: 'Registration ID' })
  @ApiResponse({ status: 200, description: 'Prerequisites have been verified.', type: Registration })
  @ApiResponse({ status: 404, description: 'Registration not found.' })
  verifyPrerequisites(@Param('id') id: string): Promise<Registration> {
    return this.registrationService.verifyAndUpdatePrerequisites(id);
  }
}
