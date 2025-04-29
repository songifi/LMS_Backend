import { Controller, Get, Post, Body, Param, Put, Delete, HttpStatus, HttpCode } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from "@nestjs/swagger"
import type { CreateLiveSessionDto } from "../dto/create-live-session.dto"
import type { UpdateLiveSessionDto } from "../dto/update-live-session.dto"
import { LiveSession } from "../entities/live-session.entity"
import { LiveSessionService } from "../providers/live-session.service"

@ApiTags("Live Sessions")
@ApiBearerAuth()
@Controller("live-sessions")
export class LiveSessionController {
  constructor(private readonly liveSessionService: LiveSessionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new live session' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The live session has been successfully created.', type: LiveSession })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  async create(@Body() createLiveSessionDto: CreateLiveSessionDto): Promise<LiveSession> {
    // In a real app, get hostId from authentication.
    const hostId = '00000000-0000-0000-0000-000000000000';
    return this.liveSessionService.create(createLiveSessionDto, hostId);
  }

  @Get()
  @ApiOperation({ summary: "Get all live sessions" })
  @ApiResponse({ status: HttpStatus.OK, description: "Return all live sessions", type: [LiveSession] })
  async findAll(): Promise<LiveSession[]> {
    return this.liveSessionService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a live session by ID' })
  @ApiParam({ name: 'id', description: 'Live session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the live session', type: LiveSession })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Live session not found' })
  async findOne(@Param('id') id: string): Promise<LiveSession> {
    return this.liveSessionService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a live session" })
  @ApiParam({ name: "id", description: "Live session ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "The live session has been successfully updated.",
    type: LiveSession,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Live session not found" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid input data." })
  async update(@Param('id') id: string, @Body() updateLiveSessionDto: UpdateLiveSessionDto): Promise<LiveSession> {
    return this.liveSessionService.update(id, updateLiveSessionDto)
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a live session' })
  @ApiParam({ name: 'id', description: 'Live session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The live session has been successfully started.', type: LiveSession })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Live session not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Session cannot be started' })
  async startSession(@Param('id') id: string): Promise<LiveSession> {
    return this.liveSessionService.startSession(id);
  }

  @Post(':id/end')
  @ApiOperation({ summary: 'End a live session' })
  @ApiParam({ name: 'id', description: 'Live session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The live session has been successfully ended.', type: LiveSession })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Live session not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Session cannot be ended' })
  async endSession(@Param('id') id: string): Promise<LiveSession> {
    return this.liveSessionService.endSession(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a live session' })
  @ApiParam({ name: 'id', description: 'Live session ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'The live session has been successfully deleted.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Live session not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.liveSessionService.remove(id);
  }
}
