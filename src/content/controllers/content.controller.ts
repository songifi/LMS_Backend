import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { CreateContentDto } from "../dto/create-content.dto"
import { UpdateContentDto } from "../dto/update-content.dto"
import { ContentSearchDto } from "../dto/content-search.dto"
import { CreateContentAccessDto } from "../dto/create-content-access.dto"
import { ContentService } from "../providers/content.service"
import { FileUploadService } from "../providers/file-upload.service"
import { ContentSearchService } from "../providers/content-search.service"
import { ContentAnalyticsService } from "../providers/content-analytics.service"
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from "@nestjs/swagger"
import type { Request } from "express"

@ApiTags("content")
@Controller("content")
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly fileUploadService: FileUploadService,
    private readonly searchService: ContentSearchService,
    private readonly analyticsService: ContentAnalyticsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
    }),
  )
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Create new content" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Content file",
        },
        contentDto: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            contentType: { type: "string", enum: ["VIDEO", "DOCUMENT", "PRESENTATION", "OTHER"] },
            moduleId: { type: "string" },
          },
        },
      },
    },
  })
  @ApiCreatedResponse({ description: "Content created successfully" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiBadRequestResponse({ description: "Invalid input data or missing file" })
  async create(
    @Body() createContentDto: CreateContentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const userId = req.user.id
    return this.contentService.create(createContentDto, file, userId)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get all content with filtering" })
  @ApiOkResponse({ description: "List of content" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  findAll(@Query() searchDto: ContentSearchDto, @Req() req: Request) {
    return this.contentService.findAll(searchDto, req.user)
  }

  @Get("search")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Search content" })
  @ApiOkResponse({ description: "Search results" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  search(@Query() searchDto: ContentSearchDto, @Req() req: Request) {
    return this.searchService.search(searchDto, req.user)
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get content by ID" })
  @ApiParam({ name: "id", description: "Content ID" })
  @ApiOkResponse({ description: "Content details" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiNotFoundResponse({ description: "Content not found" })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const content = await this.contentService.findOne(id)
    await this.analyticsService.recordView(id, req.user.id)
    return content
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update content" })
  @ApiParam({ name: "id", description: "Content ID" })
  @ApiConsumes("multipart/form-data")
  @ApiOkResponse({ description: "Content updated successfully" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have permission to update this content" })
  @ApiNotFoundResponse({ description: "Content not found" })
  async update(
    @Param('id') id: string,
    @Body() updateContentDto: UpdateContentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const content = await this.contentService.findOne(id)
    if (content.creator.id !== req.user.id && !req.user.isAdmin) {
      throw new ForbiddenException("You do not have permission to update this content")
    }
    return this.contentService.update(id, updateContentDto, file, req.user.id)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Delete content" })
  @ApiParam({ name: "id", description: "Content ID" })
  @ApiNoContentResponse({ description: "Content deleted successfully" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have permission to delete this content" })
  @ApiNotFoundResponse({ description: "Content not found" })
  async remove(@Param('id') id: string, @Req() req: Request) {
    const content = await this.contentService.findOne(id)
    if (content.creator.id !== req.user.id && !req.user.isAdmin) {
      throw new ForbiddenException("You do not have permission to delete this content")
    }
    return this.contentService.remove(id)
  }

  @Post(":id/versions")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Create new content version" })
  @ApiParam({ name: "id", description: "Content ID" })
  @ApiConsumes("multipart/form-data")
  @ApiCreatedResponse({ description: "Content version created successfully" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have permission to create versions for this content" })
  @ApiNotFoundResponse({ description: "Content not found" })
  async createVersion(
    @Param('id') id: string,
    @Body('changeNotes') changeNotes: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const content = await this.contentService.findOne(id)
    if (content.creator.id !== req.user.id && !req.user.isAdmin) {
      throw new ForbiddenException("You do not have permission to create versions for this content")
    }

    if (!file) {
      throw new BadRequestException("File is required to create a new version")
    }

    return this.contentService.createVersion(id, file, changeNotes, req.user.id)
  }

  @Get(':id/versions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get content versions' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiOkResponse({ description: 'List of content versions' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiNotFoundResponse({ description: 'Content not found' })
  getVersions(@Param('id') id: string) {
    return this.contentService.getVersions(id);
  }

  @Post(":id/access")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Add content access rule" })
  @ApiParam({ name: "id", description: "Content ID" })
  @ApiCreatedResponse({ description: "Access rule added successfully" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have permission to manage access for this content" })
  @ApiNotFoundResponse({ description: "Content not found" })
  async addAccessRule(@Param('id') id: string, @Body() accessDto: CreateContentAccessDto, @Req() req: Request) {
    const content = await this.contentService.findOne(id)
    if (content.creator.id !== req.user.id && !req.user.isAdmin) {
      throw new ForbiddenException("You do not have permission to manage access for this content")
    }

    return this.contentService.addAccessRule(id, accessDto)
  }

  @Get(":id/analytics")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get content analytics" })
  @ApiParam({ name: "id", description: "Content ID" })
  @ApiOkResponse({ description: "Content analytics data" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have permission to view analytics for this content" })
  @ApiNotFoundResponse({ description: "Content not found" })
  async getAnalytics(@Param('id') id: string, @Req() req: Request) {
    const content = await this.contentService.findOne(id)
    if (content.creator.id !== req.user.id && !req.user.isAdmin) {
      throw new ForbiddenException("You do not have permission to view analytics for this content")
    }

    return this.analyticsService.getContentAnalytics(id)
  }
}
