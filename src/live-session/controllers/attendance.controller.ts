import { Controller, Post, Body, Param, Get, Put, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from "@nestjs/swagger"
import { AttendanceService } from "../providers/attendance.service";
import { JoinSessionDto } from "../dto/join-session.dto";
import { LiveAttendance } from "../entities/live-attendance.entity";

@ApiTags("Session Attendance")
@ApiBearerAuth()
@Controller("live-sessions/:sessionId/attendance")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post("join")
  @ApiOperation({ summary: "Join a live session" })
  @ApiParam({ name: "sessionId", description: "Live session ID" })
  @ApiResponse({ status: HttpStatus.CREATED, description: "Successfully joined the session.", type: LiveAttendance })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Live session not found" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid input data." })
  async joinSession(
    @Param('sessionId') sessionId: string,
    @Body() joinSessionDto: JoinSessionDto,
  ): Promise<LiveAttendance> {
    return this.attendanceService.joinSession(sessionId, joinSessionDto)
  }

  @Post("leave/:participantId")
  @ApiOperation({ summary: "Leave a live session" })
  @ApiParam({ name: "sessionId", description: "Live session ID" })
  @ApiParam({ name: "participantId", description: "Participant ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "Successfully left the session.", type: LiveAttendance })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Attendance record not found" })
  async leaveSession(
    @Param('sessionId') sessionId: string,
    @Param('participantId') participantId: string,
  ): Promise<LiveAttendance> {
    return this.attendanceService.leaveSession(sessionId, participantId)
  }

  @Get()
  @ApiOperation({ summary: 'Get attendance for a session' })
  @ApiParam({ name: 'sessionId', description: 'Live session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return attendance records', type: [LiveAttendance] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Live session not found' })
  async getSessionAttendance(@Param('sessionId') sessionId: string): Promise<LiveAttendance[]> {
    return this.attendanceService.getSessionAttendance(sessionId);
  }

  @Put(":participantId/status")
  @ApiOperation({ summary: "Update participant status (camera/microphone)" })
  @ApiParam({ name: "sessionId", description: "Live session ID" })
  @ApiParam({ name: "participantId", description: "Participant ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "Status updated successfully.", type: LiveAttendance })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Attendance record not found" })
  async updateStatus(
    @Param('sessionId') sessionId: string,
    @Param('participantId') participantId: string,
    @Body() updates: { cameraOn?: boolean; microphoneOn?: boolean },
  ): Promise<LiveAttendance> {
    return this.attendanceService.updateAttendanceStatus(sessionId, participantId, updates)
  }
}
