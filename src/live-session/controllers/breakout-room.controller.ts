import { Controller, Post, Body, Param, Get, Delete, HttpStatus, HttpCode } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from "@nestjs/swagger"
import { BreakoutRoomService } from "../providers/breakout-room.service";
import { BreakoutRoom } from "../entities/breakout-room.entity";

@ApiTags("Breakout Rooms")
@ApiBearerAuth()
@Controller("live-sessions/:sessionId/breakout-rooms")
export class BreakoutRoomController {
  constructor(private readonly breakoutRoomService: BreakoutRoomService) {}

  @Post()
  @ApiOperation({ summary: "Create a new breakout room" })
  @ApiParam({ name: "sessionId", description: "Live session ID" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "The breakout room has been successfully created.",
    type: BreakoutRoom,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Live session not found" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid input data." })
  async create(
    @Param('sessionId') sessionId: string,
    @Body() data: { name: string; facilitatorId?: string },
  ): Promise<BreakoutRoom> {
    return await this.breakoutRoomService.create(sessionId, data.name, data.facilitatorId)
  }

  @Get()
  @ApiOperation({ summary: 'Get all breakout rooms for a session' })
  @ApiParam({ name: 'sessionId', description: 'Live session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all breakout rooms for the session', type: [BreakoutRoom] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Live session not found' })
  async findAll(@Param('sessionId') sessionId: string): Promise<BreakoutRoom[]> {
    return this.breakoutRoomService.findAll(sessionId);
  }

  @Get(':roomId')
  @ApiOperation({ summary: 'Get a breakout room by ID' })
  @ApiParam({ name: 'sessionId', description: 'Live session ID' })
  @ApiParam({ name: 'roomId', description: 'Breakout room ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the breakout room', type: BreakoutRoom })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Breakout room not found' })
  async findOne(@Param('roomId') roomId: string): Promise<BreakoutRoom> {
    return this.breakoutRoomService.findOne(roomId);
  }

  @Post(':roomId/activate')
  @ApiOperation({ summary: 'Activate a breakout room' })
  @ApiParam({ name: 'sessionId', description: 'Live session ID' })
  @ApiParam({ name: 'roomId', description: 'Breakout room ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The breakout room has been activated.', type: BreakoutRoom })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Breakout room not found' })
  async activate(@Param('roomId') roomId: string): Promise<BreakoutRoom> {
    return this.breakoutRoomService.activate(roomId);
  }

  @Post(':roomId/deactivate')
  @ApiOperation({ summary: 'Deactivate a breakout room' })
  @ApiParam({ name: 'sessionId', description: 'Live session ID' })
  @ApiParam({ name: 'roomId', description: 'Breakout room ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The breakout room has been deactivated.', type: BreakoutRoom })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Breakout room not found' })
  async deactivate(@Param('roomId') roomId: string): Promise<BreakoutRoom> {
    return this.breakoutRoomService.deactivate(roomId);
  }

  @Post(":roomId/participants/:participantId")
  @ApiOperation({ summary: "Add a participant to a breakout room" })
  @ApiParam({ name: "sessionId", description: "Live session ID" })
  @ApiParam({ name: "roomId", description: "Breakout room ID" })
  @ApiParam({ name: "participantId", description: "Participant ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "Participant added successfully.", type: BreakoutRoom })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Breakout room not found" })
  async addParticipant(
    @Param('roomId') roomId: string,
    @Param('participantId') participantId: string,
  ): Promise<BreakoutRoom> {
    return this.breakoutRoomService.addParticipant(roomId, participantId)
  }

  @Delete(":roomId/participants/:participantId")
  @ApiOperation({ summary: "Remove a participant from a breakout room" })
  @ApiParam({ name: "sessionId", description: "Live session ID" })
  @ApiParam({ name: "roomId", description: "Breakout room ID" })
  @ApiParam({ name: "participantId", description: "Participant ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "Participant removed successfully.", type: BreakoutRoom })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Breakout room not found" })
  async removeParticipant(
    @Param('roomId') roomId: string,
    @Param('participantId') participantId: string,
  ): Promise<BreakoutRoom> {
    return this.breakoutRoomService.removeParticipant(roomId, participantId)
  }

  @Post(":roomId/facilitator/:facilitatorId")
  @ApiOperation({ summary: "Assign a facilitator to a breakout room" })
  @ApiParam({ name: "sessionId", description: "Live session ID" })
  @ApiParam({ name: "roomId", description: "Breakout room ID" })
  @ApiParam({ name: "facilitatorId", description: "Facilitator ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "Facilitator assigned successfully.", type: BreakoutRoom })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Breakout room not found" })
  async assignFacilitator(
    @Param('roomId') roomId: string,
    @Param('facilitatorId') facilitatorId: string,
  ): Promise<BreakoutRoom> {
    return this.breakoutRoomService.assignFacilitator(roomId, facilitatorId)
  }

  @Delete(':roomId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a breakout room' })
  @ApiParam({ name: 'sessionId', description: 'Live session ID' })
  @ApiParam({ name: 'roomId', description: 'Breakout room ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'The breakout room has been successfully deleted.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Breakout room not found' })
  async remove(@Param('roomId') roomId: string): Promise<void> {
    return this.breakoutRoomService.remove(roomId);
  }
}
