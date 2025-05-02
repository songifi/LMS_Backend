import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Translation } from '../entities/translation.entity';
import { Language } from '../entities/language.entity';
import { CreateTranslationDto, UpdateTranslationDto } from '../dto/translation.dto';
import { AutoTranslationService } from './auto-translation.service';

@Injectable()
export class TranslationService {
  constructor(
    @InjectRepository(Translation)
    private translationRepository: Repository<Translation>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    private autoTranslationService: AutoTranslationService,
  ) {}

  async findAll(languageId?: number): Promise<Translation[]> {
    const query = this.translationRepository.createQueryBuilder('translation')
      .leftJoinAndSelect('translation.language', 'language');
    
    if (languageId) {
      query.where('translation.languageId = :languageId', { languageId });
    }
    
    return query.getMany();
  }

  async findOne(id: number): Promise<Translation> {
    const translation = await this.translationRepository.findOne({
      where: { id },
      relations: ['language'],
    });
    
    if (!translation) {
      throw new NotFoundException(`Translation with ID ${id} not found`);
    }
    
    return translation;
  }

  async findByKey(key: string, languageCode: string): Promise<Translation> {
    const language = await this.languageRepository.findOne({ where: { code: languageCode } });
    
    if (!language) {
      throw new NotFoundException(`Language with code ${languageCode} not found`);
    }
    
    const translation = await this.translationRepository.findOne({
      where: { key, languageId: language.id },
    });
    
    return translation;
  }

  async create(createTranslationDto: CreateTranslationDto): Promise<Translation> {
    const translation = this.translationRepository.create(createTranslationDto);
    return this.translationRepository.save(translation);
  }

  async update(id: number, updateTranslationDto: UpdateTranslationDto): Promise<Translation> {
    await this.translationRepository.update(id, updateTranslationDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.translationRepository.delete(id);
  }

  async syncTranslations(sourceLanguageId: number): Promise<void> {
    const sourceTranslations = await this.translationRepository.find({
      where: { languageId: sourceLanguageId },
    });
    
    const languages = await this.languageRepository.find({
      where: { id: sourceLanguageId },
    });
    
    for (const language of languages) {
      for (const sourceTranslation of sourceTranslations) {
        const existingTranslation = await this.translationRepository.findOne({
          where: { key: sourceTranslation.key, languageId: language.id },
        });
        
        if (!existingTranslation) {
          // Create a new translation with auto-translation
          const translatedValue = await this.autoTranslationService.translate(
            sourceTranslation.value,
            language.code,
          );
          
          await this.create({
            key: sourceTranslation.key,
            value: translatedValue,
            languageId: language.id,
            isAutoTranslated: true,
          });
        }
      }
    }
  }
}