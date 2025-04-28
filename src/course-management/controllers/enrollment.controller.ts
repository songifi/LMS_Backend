import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from "@nestjs/common"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { CreateEnrollmentDto } from "../dto/create-enrollment.dto"
import { UpdateEnrollmentStatusDto } from "../dto/update-enrollment-status.dto"
import { FilterEnrollmentsDto } from "../dto/filter-enrollments.dto"
import { EnrollmentService } from "../providers/enrollment.service"
import { NotificationService } from "../providers/notification.service"
import { ProgressService } from "../providers/progress.service"
import { NotificationType } from "../enums/notificationType.enum"
import { NotificationPriority } from "../enums/notificationPriority.enum"
import { EnrollmentStatus } from "../enums/enrollmentStatus.enum"
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from "@nestjs/swagger"

@ApiTags("course-management")
@Controller("course-management/enrollments")
export class EnrollmentController {
  constructor(
    private readonly enrollmentService: EnrollmentService,
    private readonly notificationService: NotificationService,
    private readonly progressService: ProgressService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Enroll a student in a course" })
  @ApiCreatedResponse({
    description: "Student enrolled successfully or added to waitlist",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: { type: "object" },
        message: { type: "string", example: "Enrollment successful" },
      },
    },
  })
  @ApiBadRequestResponse({ description: "Invalid input data" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  async createEnrollment(@Body() createEnrollmentDto: CreateEnrollmentDto, @Request() req) {
    const courseHasSpace = await this.enrollmentService.checkCourseCapacity(
      createEnrollmentDto.courseId,
      createEnrollmentDto.capacity || 30, // <- optional, if you decide to include it in DTO
    )

    const status = courseHasSpace ? EnrollmentStatus.ENROLLED : EnrollmentStatus.WAITLISTED
    const enrollment = await this.enrollmentService.createEnrollment({
      ...createEnrollmentDto,
      status,
    })

    await this.progressService.initializeProgress(enrollment)

    await this.notificationService.sendNotification({
      recipientId: createEnrollmentDto.studentId,
      courseId: createEnrollmentDto.courseId,
      type: NotificationType.ENROLLMENT,
      message: courseHasSpace
        ? `You have been successfully enrolled in the course.`
        : `You have been added to the waitlist for this course.`,
      priority: NotificationPriority.MEDIUM,
    })

    return {
      success: true,
      data: enrollment,
      message: courseHasSpace ? "Enrollment successful" : "Added to waitlist",
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get enrollments with filtering' })
  @ApiOkResponse({ description: 'List of enrollments' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  async getEnrollments(@Query() filters: FilterEnrollmentsDto) {
    const enrollments = await this.enrollmentService.getEnrollments(filters);
    return {
      success: true,
      data: enrollments,
    };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update enrollment status" })
  @ApiParam({ name: "id", description: "Enrollment ID" })
  @ApiOkResponse({ description: "Enrollment status updated successfully" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiBadRequestResponse({ description: "Invalid enrollment status" })
  async updateEnrollmentStatus(@Param('id') id: string, @Body() updateEnrollmentStatusDto: UpdateEnrollmentStatusDto) {
    const enrollment = await this.enrollmentService.updateEnrollmentStatus(id, updateEnrollmentStatusDto.status)

    // Handle waitlist promotion if a student drops
    if (updateEnrollmentStatusDto.status === EnrollmentStatus.DROPPED) {
      // Use enum value for comparison
      const promoted = await this.enrollmentService.promoteFromWaitlist(enrollment.courseId)

      if (promoted) {
        await this.notificationService.sendNotification({
          recipientId: promoted.studentId,
          courseId: promoted.courseId,
          type: NotificationType.ENROLLMENT, // Use enum value
          message: `You have been promoted from the waitlist and are now enrolled in the course.`,
          priority: NotificationPriority.HIGH, // Use enum value
        })
      }
    }

    return {
      success: true,
      data: enrollment,
    }
  }
}
