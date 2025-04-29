import { Controller, Get, Post, Body, Param, Delete, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import type { CreateWaitlistDto } from "../dto/create-waitlist.dto"
import { WaitlistPosition } from "../entities/waitlist-position.entity"
import { WaitlistService } from "../providers/waitlist.service";

@ApiTags("waitlists")
@Controller("waitlists")
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  @ApiOperation({ summary: 'Join waitlist' })
  @ApiResponse({ status: 201, description: 'Successfully added to waitlist.', type: WaitlistPosition })
  @ApiResponse({ status: 400, description: 'Invalid input data or waitlist is not active or full.' })
  @ApiResponse({ status: 409, description: 'Student is already on the waitlist for this course.' })
  create(@Body() createWaitlistDto: CreateWaitlistDto): Promise<WaitlistPosition> {
    return this.waitlistService.addToWaitlist(createWaitlistDto);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get waitlist positions for a student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Return all waitlist positions for the student.', type: [WaitlistPosition] })
  getWaitlistPositions(@Param('studentId') studentId: string): Promise<WaitlistPosition[]> {
    return this.waitlistService.getWaitlistPositions(studentId);
  }

  @Get("course")
  @ApiOperation({ summary: "Get waitlist for a course" })
  @ApiQuery({ name: "courseId", required: true, description: "Course ID" })
  @ApiQuery({ name: "sectionId", required: false, description: "Section ID" })
  @ApiQuery({ name: "semesterId", required: true, description: "Semester ID" })
  @ApiResponse({ status: 200, description: "Return all waitlist positions for the course.", type: [WaitlistPosition] })
  getWaitlistForCourse(
    @Query('courseId') courseId: string,
    @Query('sectionId') sectionId: string,
    @Query('semesterId') semesterId: string,
  ): Promise<WaitlistPosition[]> {
    return this.waitlistService.getWaitlistForCourse(courseId, sectionId, semesterId)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove from waitlist' })
  @ApiParam({ name: 'id', description: 'Waitlist position ID' })
  @ApiResponse({ status: 200, description: 'Successfully removed from waitlist.' })
  @ApiResponse({ status: 404, description: 'Waitlist position not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.waitlistService.removeFromWaitlist(id);
  }

  @Post('process-next')
  @ApiOperation({ summary: 'Process next waitlist position' })
  @ApiResponse({ status: 200, description: 'Next waitlist position processed.', type: WaitlistPosition })
  processNextWaitlistPosition(
    @Body() body: { courseId: string; sectionId?: string; semesterId: string },
  ): Promise<WaitlistPosition | null> {
    return this.waitlistService.processNextWaitlistPosition(body.courseId, body.sectionId || null, body.semesterId);
  }
}
