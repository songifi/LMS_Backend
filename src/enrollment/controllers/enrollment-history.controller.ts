import { Controller, Get, Param } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger"
import { RegistrationHistory } from "../entities/registration-history.entity"
import { EnrollmentHistoryService } from "../providers/enrollment-history.service";

@ApiTags("enrollment-history")
@Controller("enrollment-history")
export class EnrollmentHistoryController {
  constructor(private readonly enrollmentHistoryService: EnrollmentHistoryService) {}

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get enrollment history for a student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Return enrollment history for the student.', type: [RegistrationHistory] })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Return enrollment history for the student.', type: [RegistrationHistory] })
  findByStudent(@Param('studentId') studentId: string): Promise<RegistrationHistory[]> {
    return this.enrollmentHistoryService.findByStudent(studentId);
  }

  @Get('registration/:registrationId')
  @ApiOperation({ summary: 'Get history for a registration' })
  @ApiParam({ name: 'registrationId', description: 'Registration ID' })
  @ApiResponse({ status: 200, description: 'Return history for the registration.', type: [RegistrationHistory] })
  @ApiParam({ name: 'registrationId', description: 'Registration ID' })
  @ApiResponse({ status: 200, description: 'Return history for the registration.', type: [RegistrationHistory] })
  findByRegistration(@Param('registrationId') registrationId: string): Promise<RegistrationHistory[]> {
    return this.enrollmentHistoryService.findByRegistration(registrationId);
  }
}
