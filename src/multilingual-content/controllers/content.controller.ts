import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ContentTranslationService } from '../services/content-translation.service';
import { Content } from '../entities/content.entity';
import { ContentTranslation } from '../entities/content-translation.entity';
import { CreateContentDto, CreateContentTranslationDto, UpdateContentTranslationDto } from '../dto/content.dto';

@Controller('content')
export class ContentController {
  constructor(private readonly contentTranslationService: ContentTranslationService) {}

  @Get()
  findAllContent(): Promise<Content[]> {
    return this.contentTranslationService.findAllContent();
  }

  @Get(':id')
  findContentById(@Param('id', ParseIntPipe) id: number): Promise<Content> {
    return this.contentTranslationService.findContentById(id);
  }

  @Post()
  createContent(@Body() createContentDto: CreateContentDto): Promise<Content> {
    return this.contentTranslationService.createContent(createContentDto);
  }

  @Get(':contentId/translations/:languageId')
  findContentTranslation(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Param('languageId', ParseIntPipe) languageId: number,
  ): Promise<ContentTranslation> {
    return this.contentTranslationService.findContentTranslation(contentId, languageId);
  }

  @Post('translations')
  createContentTranslation(@Body() createDto: CreateContentTranslationDto): Promise<ContentTranslation> {
    return this.contentTranslationService.createContentTranslation(createDto);
  }

  @Put('translations/:id')
  updateContentTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateContentTranslationDto,
  ): Promise<ContentTranslation> {
    return this.contentTranslationService.updateContentTranslation(id, updateDto);
  }

  @Post(':contentId/sync')
  syncContentTranslations(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body('sourceLanguageId', ParseIntPipe) sourceLanguageId: number,
  ): Promise<void> {
    return this.contentTranslationService.syncContentTranslations(contentId, sourceLanguageId);
  }
}