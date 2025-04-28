import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from "@nestjs/common"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { Roles } from "../../auth/decorators/roles.decorator"
import { ForumService } from "../providers/discussion-forum.service"
import { CreateForumDto } from "../dto/create-discussion-forum.dto"
import { RolesGuard } from "src/auth/guards/role.guard"
import { UpdateForumDto } from "../dto/update-discussion-forum.dto"
import { RoleEnum } from "../../user/role.enum"
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger"

@ApiTags("forum")
@Controller("forums")
@UseGuards(JwtAuthGuard)
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all forums' })
  @ApiOkResponse({ description: 'List of forums' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  async findAll(@Request() req: any) {
    return this.forumService.findAll(req.user);
  }

  @Post()
  @ApiBearerAuth("JWT-auth")
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.INSTRUCTOR)
  @ApiOperation({ summary: "Create a new forum" })
  @ApiCreatedResponse({ description: "Forum created successfully" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have required role" })
  async create(@Body() createForumDto: CreateForumDto, @Request() req: any) {
    return this.forumService.create(createForumDto, req.user)
  }

  @Get(":id")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get forum by ID" })
  @ApiParam({ name: "id", description: "Forum ID" })
  @ApiOkResponse({ description: "Forum details" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiNotFoundResponse({ description: "Forum not found" })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.forumService.findOne(id, req.user)
  }

  @Put(":id")
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.INSTRUCTOR)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update forum" })
  @ApiParam({ name: "id", description: "Forum ID" })
  @ApiOkResponse({ description: "Forum updated successfully" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have required role or permission" })
  @ApiNotFoundResponse({ description: "Forum not found" })
  async update(@Param('id') id: string, @Body() updateForumDto: UpdateForumDto, @Request() req: any) {
    return this.forumService.update(id, updateForumDto, req.user)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete forum' })
  @ApiParam({ name: 'id', description: 'Forum ID' })
  @ApiNoContentResponse({ description: 'Forum deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have required role' })
  @ApiNotFoundResponse({ description: 'Forum not found' })
  async remove(@Param('id') id: string) {
    return this.forumService.remove(id);
  }

  @Get(":id/topics")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get forum topics" })
  @ApiParam({ name: "id", description: "Forum ID" })
  @ApiOkResponse({ description: "List of forum topics" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiNotFoundResponse({ description: "Forum not found" })
  async getTopics(@Param('id') id: string, @Request() req: any) {
    return this.forumService.getTopics(id, req.user)
  }
}
