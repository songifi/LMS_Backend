import { Controller, Post, Body, Param, Get, Delete, HttpStatus, HttpCode } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from "@nestjs/swagger"
import { InteractiveToolService } from "../providers/interactive-tool.service";
import { CreateInteractiveToolDto } from "../dto/create-interactive-tool.dto";
import { InteractiveTool } from "../entities/interactive-tool.entity";

@ApiTags("Interactive Tools")
@ApiBearerAuth()
@Controller("live-sessions/:sessionId/tools")
export class InteractiveToolController {
  constructor(private readonly interactiveToolService: InteractiveToolService) {}

  @Post()
  @ApiOperation({ summary: "Create a new interactive tool for a session" })
  @ApiParam({ name: "sessionId", description: "Live session ID" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "The tool has been successfully created.",
    type: InteractiveTool,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Live session not found" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid input data." })
  async create(
    @Param('sessionId') sessionId: string,
    @Body() createToolDto: CreateInteractiveToolDto,
  ): Promise<InteractiveTool> {
    return this.interactiveToolService.create(sessionId, createToolDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all interactive tools for a session' })
  @ApiParam({ name: 'sessionId', description: 'Live session ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all tools for the session', type: [InteractiveTool] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Live session not found' })
  async findAll(@Param('sessionId') sessionId: string): Promise<InteractiveTool[]> {
    return this.interactiveToolService.findAll(sessionId);
  }

  @Get(':toolId')
  @ApiOperation({ summary: 'Get an interactive tool by ID' })
  @ApiParam({ name: 'sessionId', description: 'Live session ID' })
  @ApiParam({ name: 'toolId', description: 'Tool ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the tool', type: InteractiveTool })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tool not found' })
  async findOne(@Param('toolId') toolId: string): Promise<InteractiveTool> {
    return this.interactiveToolService.findOne(toolId);
  }

  @Post(':toolId/activate')
  @ApiOperation({ summary: 'Activate an interactive tool' })
  @ApiParam({ name: 'sessionId', description: 'Live session ID' })
  @ApiParam({ name: 'toolId', description: 'Tool ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The tool has been activated.', type: InteractiveTool })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tool not found' })
  async activate(@Param('toolId') toolId: string): Promise<InteractiveTool> {
    return this.interactiveToolService.activate(toolId);
  }

  @Post(':toolId/deactivate')
  @ApiOperation({ summary: 'Deactivate an interactive tool' })
  @ApiParam({ name: 'sessionId', description: 'Live session ID' })
  @ApiParam({ name: 'toolId', description: 'Tool ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The tool has been deactivated.', type: InteractiveTool })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tool not found' })
  async deactivate(@Param('toolId') toolId: string): Promise<InteractiveTool> {
    return this.interactiveToolService.deactivate(toolId);
  }

  @Post(":toolId/responses")
  @ApiOperation({ summary: "Submit a response to an interactive tool" })
  @ApiParam({ name: "sessionId", description: "Live session ID" })
  @ApiParam({ name: "toolId", description: "Tool ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "Response submitted successfully.", type: InteractiveTool })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Tool not found or not active" })
  async submitResponse(
    @Param('toolId') toolId: string,
    @Body() data: { participantId: string; response: any },
  ): Promise<InteractiveTool> {
    return this.interactiveToolService.submitResponse(toolId, data.participantId, data.response)
  }

  @Delete(':toolId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an interactive tool' })
  @ApiParam({ name: 'sessionId', description: 'Live session ID' })
  @ApiParam({ name: 'toolId', description: 'Tool ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'The tool has been successfully deleted.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tool not found' })
  async remove(@Param('toolId') toolId: string): Promise<void> {
    return this.interactiveToolService.remove(toolId);
  }
}
