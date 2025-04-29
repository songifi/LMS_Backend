import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConsumes, ApiQuery } from "@nestjs/swagger"
import { CreateResourceDto } from "../dto/create-resource.dto"
import { UpdateResourceDto } from "../dto/update-resource.dto"
import { Resource } from "../entities/resource.entity"
import { FileInterceptor } from "@nestjs/platform-express"
import type { Express } from "express"
import { ResourcesService } from "../providers/resources.service"
import { VersionsService } from "../providers/versions.service"
import { SearchService } from "../providers/search.service"
import { RecommendationsService } from "../providers/recommendations.service"
import { SearchResourceDto } from "../dto/search-resource.dto"
import { ResourceRecommendation } from "../entities/resource-recommendation.entity"
import { CreateVersionDto } from "../dto/create-version.dto"
import { ResourceVersion } from "../entities/resource-version.entity"

@ApiTags("resources")
@Controller("resources")
export class ResourcesController {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly versionsService: VersionsService,
    private readonly searchService: SearchService,
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all resources" })
  @ApiResponse({ status: 200, description: "Return all resources", type: [Resource] })
  findAll(): Promise<Resource[]> {
    return this.resourcesService.findAll()
  }

  @Get('search')
  @ApiOperation({ summary: 'Search resources' })
  @ApiResponse({ status: 200, description: 'Return search results', type: [Resource] })
  search(@Query() searchDto: SearchResourceDto): Promise<{ items: Resource[]; total: number; page: number; limit: number }> {
    return this.searchService.search(searchDto);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get resource recommendations for the current user' })
  @ApiResponse({ status: 200, description: 'Return recommended resources', type: [ResourceRecommendation] })
  @ApiQuery({ name: 'userId', required: true, description: 'ID of the user to get recommendations for' })
  getRecommendations(@Query('userId') userId: string): Promise<ResourceRecommendation[]> {
    return this.recommendationsService.getRecommendationsForUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a resource by ID' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'Return the resource', type: Resource })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Resource> {
    return this.resourcesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new resource' })
  @ApiBody({ type: CreateResourceDto })
  @ApiResponse({ status: 201, description: 'The resource has been created', type: Resource })
  create(@Body() createResourceDto: CreateResourceDto): Promise<Resource> {
    return this.resourcesService.create(createResourceDto);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a resource file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The file has been uploaded' })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    // This would typically upload to a storage service and return a URL
    return {
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${file.filename}`, // This would be the actual URL in production
    };
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a resource" })
  @ApiParam({ name: "id", description: "Resource ID" })
  @ApiBody({ type: UpdateResourceDto })
  @ApiResponse({ status: 200, description: "The resource has been updated", type: Resource })
  @ApiResponse({ status: 404, description: "Resource not found" })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateResourceDto: UpdateResourceDto): Promise<Resource> {
    return this.resourcesService.update(id, updateResourceDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a resource' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'The resource has been deleted' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.resourcesService.remove(id);
  }

  @Post(":id/versions")
  @ApiOperation({ summary: "Create a new version of a resource" })
  @ApiParam({ name: "id", description: "Resource ID" })
  @ApiBody({ type: CreateVersionDto })
  @ApiResponse({ status: 201, description: "The version has been created", type: ResourceVersion })
  @ApiResponse({ status: 404, description: "Resource not found" })
  createVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createVersionDto: CreateVersionDto,
  ): Promise<ResourceVersion> {
    return this.versionsService.createVersion(id, createVersionDto)
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get all versions of a resource' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'Return all versions', type: [ResourceVersion] })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  getVersions(@Param('id', ParseUUIDPipe) id: string): Promise<ResourceVersion[]> {
    return this.versionsService.getVersions(id);
  }

  @Get(":id/versions/:versionNumber")
  @ApiOperation({ summary: "Get a specific version of a resource" })
  @ApiParam({ name: "id", description: "Resource ID" })
  @ApiParam({ name: "versionNumber", description: "Version number" })
  @ApiResponse({ status: 200, description: "Return the version", type: ResourceVersion })
  @ApiResponse({ status: 404, description: "Resource or version not found" })
  getVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionNumber') versionNumber: number,
  ): Promise<ResourceVersion> {
    return this.versionsService.getVersion(id, versionNumber)
  }
}
