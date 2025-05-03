import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TranslationService } from '../services/translation.service';
import { AutoTranslationService } from '../services/auto-translation.service';
import { Translation } from '../entities/translation.entity';
import { CreateTranslationDto, UpdateTranslationDto, TranslateTextDto } from '../dto/translation.dto';

@Controller('translations')
export class TranslationController {
  constructor(
    private readonly translationService: TranslationService,
    private readonly autoTranslationService: AutoTranslationService,
  ) {}

  @Get()
  findAll(@Query('languageId') languageId?: number): Promise<Translation[]> {
    return this.translationService.findAll(languageId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Translation> {
    return this.translationService.findOne(id);
  }

  @Get('key/:key')
  findByKey(
    @Param('key') key: string,
    @Query('languageCode') languageCode: string,
  ): Promise<Translation> {
    return this.translationService.findByKey(key, languageCode);
  }

  @Post()
  create(@Body() createTranslationDto: CreateTranslationDto): Promise<Translation> {
    return this.translationService.create(createTranslationDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTranslationDto: UpdateTranslationDto,
  ): Promise<Translation> {
    return this.translationService.update(id, updateTranslationDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.translationService.remove(id);
  }

  @Post('sync')
  syncTranslations(@Body('sourceLanguageId', ParseIntPipe) sourceLanguageId: number): Promise<void> {
    return this.translationService.syncTranslations(sourceLanguageId);
  }

  @Post('translate')
  async translateText(@Body() translateTextDto: TranslateTextDto): Promise<{ translatedText: string }> {
    const translatedText = await this.autoTranslationService.translate(
      translateTextDto.text,
      translateTextDto.targetLanguageCode,
      translateTextDto.sourceLanguageCode,
    );
    
    return { translatedText };
  }

  @Post('detect-language')
  async detectLanguage(@Body('text') text: string): Promise<{ detectedLanguage: string }> {
    const detectedLanguage = await this.autoTranslationService.detectLanguage(text);
    return { detectedLanguage };
  }
}