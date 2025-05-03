import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../entities/language.entity';
import { CreateLanguageDto, UpdateLanguageDto } from '../dto/language.dto';

@Injectable()
export class LanguageService {
  constructor(
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
  ) {}

  async findAll(): Promise<Language[]> {
    return this.languageRepository.find();
  }

  async findOne(id: number): Promise<Language> {
    return this.languageRepository.findOne({ where: { id } });
  }

  async findByCode(code: string): Promise<Language> {
    return this.languageRepository.findOne({ where: { code } });
  }

  async getDefaultLanguage(): Promise<Language> {
    return this.languageRepository.findOne({ where: { isDefault: true } });
  }

  async create(createLanguageDto: CreateLanguageDto): Promise<Language> {
    const language = this.languageRepository.create(createLanguageDto);
    return this.languageRepository.save(language);
  }

  async update(id: number, updateLanguageDto: UpdateLanguageDto): Promise<Language> {
    await this.languageRepository.update(id, updateLanguageDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.languageRepository.delete(id);
  }
}