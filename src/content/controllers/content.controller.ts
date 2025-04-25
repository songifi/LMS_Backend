// src/content/controllers/content.controller.ts
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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateContentDto } from '../dto/create-content.dto';
import { UpdateContentDto } from '../dto/update-content.dto';
import { ContentSearchDto } from '../dto/content-search.dto';
import { CreateContentAccessDto } from '../dto/create-content-access.dto';
import { ContentService } from '../providers/content.service';
import { FileUploadService } from '../providers/file-upload.service';
import { ContentSearchService } from '../providers/content-search.service';
import { ContentAnalyticsService } from '../providers/content-analytics.service';

@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly fileUploadService: FileUploadService,
    private readonly searchService: ContentSearchService,
    private readonly analyticsService: ContentAnalyticsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  }))
  async create(
    @Body() createContentDto: CreateContentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.contentService.create(createContentDto, file, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() searchDto: ContentSearchDto, @Req() req) {
    return this.contentService.findAll(searchDto, req.user);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  search(@Query() searchDto: ContentSearchDto, @Req() req) {
    return this.searchService.search(searchDto, req.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Req() req) {
    const content = await this.contentService.findOne(id);
    await this.analyticsService.recordView(id, req.user.id);
    return content;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() updateContentDto: UpdateContentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const content = await this.contentService.findOne(id);
    if (content.creator.id !== req.user.id && !req.user.isAdmin) {
      throw new ForbiddenException('You do not have permission to update this content');
    }
    return this.contentService.update(id, updateContentDto, file, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req) {
    const content = await this.contentService.findOne(id);
    if (content.creator.id !== req.user.id && !req.user.isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this content');
    }
    return this.contentService.remove(id);
  }

  @Post(':id/versions')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async createVersion(
    @Param('id') id: string,
    @Body('changeNotes') changeNotes: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const content = await this.contentService.findOne(id);
    if (content.creator.id !== req.user.id && !req.user.isAdmin) {
      throw new ForbiddenException('You do not have permission to create versions for this content');
    }
    
    if (!file) {
      throw new Error('File is required to create a new version');
    }
    
    return this.contentService.createVersion(id, file, changeNotes, req.user.id);
  }

  @Get(':id/versions')
  @UseGuards(JwtAuthGuard)
  getVersions(@Param('id') id: string) {
    return this.contentService.getVersions(id);
  }

  @Post(':id/access')
  @UseGuards(JwtAuthGuard)
  async addAccessRule(
    @Param('id') id: string,
    @Body() accessDto: CreateContentAccessDto,
    @Req() req,
  ) {
    const content = await this.contentService.findOne(id);
    if (content.creator.id !== req.user.id && !req.user.isAdmin) {
      throw new ForbiddenException('You do not have permission to manage access for this content');
    }
    
    return this.contentService.addAccessRule(id, accessDto);
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard)
  async getAnalytics(@Param('id') id: string, @Req() req) {
    const content = await this.contentService.findOne(id);
    if (content.creator.id !== req.user.id && !req.user.isAdmin) {
      throw new ForbiddenException('You do not have permission to view analytics for this content');
    }
    
    return this.analyticsService.getContentAnalytics(id);
  }
}