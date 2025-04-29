import { Controller, Post, Param, Get, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from "@nestjs/swagger"
import { RecordingService } from "../providers/recording.service";
import { SessionRecording } from "../entities/session-recording.entity";

@ApiTags("Session Recordings")
@ApiBearerAuth()
@Controller()
export class RecordingController {
  constructor(private readonly recordingService: RecordingService) {}

  @Post('live-sessions/:sessionId/recordings/start')
  @ApiOperation({ summary: 'Start recording a live session' })
  @ApiParam({ name: 'sessionId', description: 'Live session ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Recording started successfully.', type: SessionRecording })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Live session not found' })
  async startRecording(@Param('sessionId') sessionId: string): Promise<SessionRecording> {
    return this.recordingService.startRecording(sessionId);
  }

  @Post('live-sessions/:sessionId/recordings/stop')
  @ApiOperation({ summary: 'Stop recording a live session' })
  @ApiParam({ name: 'sessionId', description: 'Live session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Recording stopped successfully.', type: SessionRecording })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Live session not found or no active recording' })
  async stopRecording(@Param('sessionId') sessionId: string): Promise<SessionRecording> {
    return this.recordingService.stopRecording(sessionId);
  }

  @Get("recordings")
  @ApiOperation({ summary: "Get all session recordings" })
  @ApiResponse({ status: HttpStatus.OK, description: "Return all recordings", type: [SessionRecording] })
  async getAllRecordings(): Promise<SessionRecording[]> {
    return this.recordingService.getAllRecordings()
  }

  @Get('recordings/:id')
  @ApiOperation({ summary: 'Get a recording by ID' })
  @ApiParam({ name: 'id', description: 'Recording ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the recording', type: SessionRecording })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Recording not found' })
  async getRecording(@Param('id') id: string): Promise<SessionRecording> {
    return this.recordingService.getRecording(id);
  }

  @Get('live-sessions/:sessionId/recordings')
  @ApiOperation({ summary: 'Get recording for a specific session' })
  @ApiParam({ name: 'sessionId', description: 'Live session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the session recording', type: SessionRecording })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Live session not found or no recording' })
  async getSessionRecording(@Param('sessionId') sessionId: string): Promise<SessionRecording> {
    return this.recordingService.getSessionRecording(sessionId);
  }
}
