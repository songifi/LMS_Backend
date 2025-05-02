import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { LanguageService } from '../services/language.service';
import { Language } from '../entities/language.entity';
import { CreateLanguageDto, UpdateLanguageDto } from '../dto/language.dto';

@Controller('languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get()
  findAll(): Promise<Language[]> {
    return this.languageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Language> {
    return this.languageService.findOne(id);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string): Promise<Language> {
    return this.languageService.findByCode(code);
  }

  @Get('default')
  getDefaultLanguage(): Promise<Language> {
    return this.languageService.getDefaultLanguage();
  }

  @Post()
  create(@Body() createLanguageDto: CreateLanguageDto): Promise<Language> {
    return this.languageService.create(createLanguageDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ): Promise<Language> {
    return this.languageService.update(id, updateLanguageDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.languageService.remove(id);
  }
}