import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { RegionService } from '../services/region.service';
import { Region } from '../entities/region.entity';
import { RegionLanguage } from '../entities/region-language.entity';
import { Language } from '../entities/language.entity';
import { CreateRegionDto, UpdateRegionDto, SetRegionLanguageDto } from '../dto/region.dto';

@Controller('regions')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get()
  findAllRegions(): Promise<Region[]> {
    return this.regionService.findAllRegions();
  }

  @Get(':id')
  findRegionById(@Param('id', ParseIntPipe) id: number): Promise<Region> {
    return this.regionService.findRegionById(id);
  }

  @Get('code/:code')
  findRegionByCode(@Param('code') code: string): Promise<Region> {
    return this.regionService.findRegionByCode(code);
  }

  @Post()
  createRegion(@Body() createRegionDto: CreateRegionDto): Promise<Region> {
    return this.regionService.createRegion(createRegionDto);
  }

  @Put(':id')
  updateRegion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRegionDto: UpdateRegionDto,
  ): Promise<Region> {
    return this.regionService.updateRegion(id, updateRegionDto);
  }

  @Delete(':id')
  removeRegion(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.regionService.removeRegion(id);
  }

  @Get(':regionId/languages')
  getRegionLanguages(@Param('regionId', ParseIntPipe) regionId: number): Promise<RegionLanguage[]> {
    return this.regionService.getRegionLanguages(regionId);
  }

  @Get(':regionId/default-language')
  getRegionDefaultLanguage(@Param('regionId', ParseIntPipe) regionId: number): Promise<Language> {
    return this.regionService.getRegionDefaultLanguage(regionId);
  }

  @Post('languages')
  setRegionLanguage(@Body() dto: SetRegionLanguageDto): Promise<RegionLanguage> {
    return this.regionService.setRegionLanguage(dto);
  }

  @Delete(':regionId/languages/:languageId')
  removeRegionLanguage(
    @Param('regionId', ParseIntPipe) regionId: number,
    @Param('languageId', ParseIntPipe) languageId: number,
  ): Promise<void> {
    return this.regionService.removeRegionLanguage(regionId, languageId);
  }
}