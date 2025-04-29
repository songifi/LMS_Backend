import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger"
import type { CreateEnrollmentPeriodDto } from "../dto/create-enrollment-period.dto"
import { EnrollmentPeriod } from "../entities/enrollment-period.entity"
import { EnrollmentPeriodService } from "../providers/enrollment-period.service"

@ApiTags("enrollment-periods")
@Controller("enrollment-periods")
export class EnrollmentPeriodController {
  constructor(private readonly enrollmentPeriodService: EnrollmentPeriodService) {}

  @Post()
  @ApiOperation({ summary: "Create a new enrollment period" })
  @ApiResponse({
    status: 201,
    description: "The enrollment period has been successfully created.",
    type: EnrollmentPeriod,
  })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  @Post()
  @ApiOperation({ summary: "Get all enrollment periods" })
  @ApiResponse({ status: 200, description: "Return all enrollment periods.", type: [EnrollmentPeriod] })
  findAll(): Promise<EnrollmentPeriod[]> {
    return this.enrollmentPeriodService.findAll()
  }

  @Get("active")
  @ApiOperation({ summary: "Get active enrollment periods" })
  @ApiResponse({ status: 200, description: "Return active enrollment periods.", type: [EnrollmentPeriod] })
  findActive(): Promise<EnrollmentPeriod[]> {
    return this.enrollmentPeriodService.findActive()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enrollment period by id' })
  @ApiParam({ name: 'id', description: 'Enrollment period ID' })
  @ApiResponse({ status: 200, description: 'Return the enrollment period.', type: EnrollmentPeriod })
  @ApiResponse({ status: 404, description: 'Enrollment period not found.' })
  findOne(@Param('id') id: string): Promise<EnrollmentPeriod> {
    return this.enrollmentPeriodService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update enrollment period" })
  @ApiParam({ name: "id", description: "Enrollment period ID" })
  @ApiResponse({
    status: 200,
    description: "The enrollment period has been successfully updated.",
    type: EnrollmentPeriod,
  })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  @ApiResponse({ status: 404, description: "Enrollment period not found." })
  update(
    @Param('id') id: string,
    @Body() updateEnrollmentPeriodDto: Partial<CreateEnrollmentPeriodDto>,
  ): Promise<EnrollmentPeriod> {
    return this.enrollmentPeriodService.update(id, updateEnrollmentPeriodDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete enrollment period' })
  @ApiParam({ name: 'id', description: 'Enrollment period ID' })
  @ApiResponse({ status: 200, description: 'The enrollment period has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Enrollment period not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.enrollmentPeriodService.remove(id);
  }

  @Get("academic/:term/:year")
  @ApiOperation({ summary: "Get enrollment periods by academic term and year" })
  @ApiParam({ name: "term", description: "Academic term" })
  @ApiParam({ name: "year", description: "Academic year" })
  @ApiResponse({
    status: 200,
    description: "Return enrollment periods for the specified academic term and year.",
    type: [EnrollmentPeriod],
  })
  findByAcademicTerm(@Param('term') term: string, @Param('year') year: string): Promise<EnrollmentPeriod[]> {
    return this.enrollmentPeriodService.findByAcademicTerm(term, year)
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate enrollment period' })
  @ApiParam({ name: 'id', description: 'Enrollment period ID' })
  @ApiResponse({ status: 200, description: 'The enrollment period has been successfully activated.', type: EnrollmentPeriod })
  @ApiResponse({ status: 404, description: 'Enrollment period not found.' })
  activate(@Param('id') id: string): Promise<EnrollmentPeriod> {
    return this.enrollmentPeriodService.activateEnrollmentPeriod(id);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate enrollment period' })
  @ApiParam({ name: 'id', description: 'Enrollment period ID' })
  @ApiResponse({ status: 200, description: 'The enrollment period has been successfully deactivated.', type: EnrollmentPeriod })
  @ApiResponse({ status: 404, description: 'Enrollment period not found.' })
  deactivate(@Param('id') id: string): Promise<EnrollmentPeriod> {
    return this.enrollmentPeriodService.deactivateEnrollmentPeriod(id);
  }
}
