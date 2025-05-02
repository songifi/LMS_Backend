import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../entities/region.entity';
import { RegionLanguage } from '../entities/region-language.entity';
import { Language } from '../entities/language.entity';
import { CreateRegionDto, UpdateRegionDto, SetRegionLanguageDto } from '../dto/region.dto';

@Injectable()
export class RegionService {
  constructor(
    @InjectRepository(Region)
    private regionRepository: Repository<Region>,
    @InjectRepository(RegionLanguage)
    private regionLanguageRepository: Repository<RegionLanguage>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
  ) {}

  async findAllRegions(): Promise<Region[]> {
    return this.regionRepository.find({
      relations: ['languages', 'languages.language'],
    });
  }

  async findRegionById(id: number): Promise<Region> {
    const region = await this.regionRepository.findOne({
      where: { id },
      relations: ['languages', 'languages.language'],
    });
    
    if (!region) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }
    
    return region;
  }

  async findRegionByCode(code: string): Promise<Region> {
    const region = await this.regionRepository.findOne({
      where: { code },
      relations: ['languages', 'languages.language'],
    });
    
    if (!region) {
      throw new NotFoundException(`Region with code ${code} not found`);
    }
    
    return region;
  }

  async createRegion(createRegionDto: CreateRegionDto): Promise<Region> {
    const region = this.regionRepository.create({
      code: createRegionDto.code,
      name: createRegionDto.name,
    });
    
    return this.regionRepository.save(region);
  }

  async updateRegion(id: number, updateRegionDto: UpdateRegionDto): Promise<Region> {
    await this.regionRepository.update(id, updateRegionDto);
    return this.findRegionById(id);
  }

  async removeRegion(id: number): Promise<void> {
    await this.regionRepository.delete(id);
  }

  async getRegionLanguages(regionId: number): Promise<RegionLanguage[]> {
    return this.regionLanguageRepository.find({
      where: { regionId },
      relations: ['language'],
    });
  }

  async getRegionDefaultLanguage(regionId: number): Promise<Language> {
    const regionLanguage = await this.regionLanguageRepository.findOne({
      where: { regionId, isDefault: true },
      relations: ['language'],
    });
    
    if (regionLanguage) {
      return regionLanguage.language;
    }
    
    // Return global default language if no region default is set
    return this.languageRepository.findOne({ where: { isDefault: true } });
  }

  async setRegionLanguage(dto: SetRegionLanguageDto): Promise<RegionLanguage> {
    const region = await this.regionRepository.findOne({ where: { id: dto.regionId } });
    if (!region) {
      throw new NotFoundException(`Region with ID ${dto.regionId} not found`);
    }
    
    const language = await this.languageRepository.findOne({ where: { id: dto.languageId } });
    if (!language) {
      throw new NotFoundException(`Language with ID ${dto.languageId} not found`);
    }
    
    // If setting as default, unset any existing default
    if (dto.isDefault) {
      await this.regionLanguageRepository.update(
        { regionId: dto.regionId, isDefault: true },
        { isDefault: false }
      );
    }
    
    // Check if relationship already exists
    let regionLanguage = await this.regionLanguageRepository.findOne({
      where: { regionId: dto.regionId, languageId: dto.languageId },
    });
    
    if (regionLanguage) {
      // Update existing relationship
      regionLanguage.isDefault = dto.isDefault;
      return this.regionLanguageRepository.save(regionLanguage);
    } else {
      // Create new relationship
      regionLanguage = this.regionLanguageRepository.create({
        regionId: dto.regionId,
        languageId: dto.languageId,
        isDefault: dto.isDefault,
      });
      return this.regionLanguageRepository.save(regionLanguage);
    }
  }

  async removeRegionLanguage(regionId: number, languageId: number): Promise<void> {
    const regionLanguage = await this.regionLanguageRepository.findOne({
      where: { regionId, languageId },
    });
    
    if (!regionLanguage) {
      throw new NotFoundException(`Region language relationship not found for region ID ${regionId} and language ID ${languageId}`);
    }
    
    await this.regionLanguageRepository.remove(regionLanguage);
  }
}