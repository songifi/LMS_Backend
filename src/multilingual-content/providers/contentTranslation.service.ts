import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from '../entities/content.entity';
import { ContentTranslation } from '../entities/content-translation.entity';
import { Language } from '../entities/language.entity';
import { CreateContentDto, CreateContentTranslationDto, UpdateContentTranslationDto } from '../dto/content.dto';
import { AutoTranslationService } from './auto-translation.service';

@Injectable()
export class ContentTranslationService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(ContentTranslation)
    private contentTranslationRepository: Repository<ContentTranslation>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    private autoTranslationService: AutoTranslationService,
  ) {}

  async findAllContent(): Promise<Content[]> {
    return this.contentRepository.find({
      relations: ['translations', 'translations.language'],
    });
  }

  async findContentById(id: number): Promise<Content> {
    const content = await this.contentRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });
    
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    
    return content;
  }

  async createContent(createContentDto: CreateContentDto): Promise<Content> {
    const content = this.contentRepository.create({
      type: createContentDto.type,
      identifier: createContentDto.identifier,
    });
    
    return this.contentRepository.save(content);
  }

  async findContentTranslation(contentId: number, languageId: number): Promise<ContentTranslation> {
    return this.contentTranslationRepository.findOne({
      where: { contentId, languageId },
      relations: ['language', 'content'],
    });
  }

  async createContentTranslation(createDto: CreateContentTranslationDto): Promise<ContentTranslation> {
    const content = await this.contentRepository.findOne({ where: { id: createDto.contentId } });
    if (!content) {
      throw new NotFoundException(`Content with ID ${createDto.contentId} not found`);
    }
    
    const language = await this.languageRepository.findOne({ where: { id: createDto.languageId } });
    if (!language) {
      throw new NotFoundException(`Language with ID ${createDto.languageId} not found`);
    }
    
    const contentTranslation = this.contentTranslationRepository.create({
      contentId: createDto.contentId,
      languageId: createDto.languageId,
      value: createDto.value,
      isAutoTranslated: createDto.isAutoTranslated || false,
    });
    
    return this.contentTranslationRepository.save(contentTranslation);
  }

  async updateContentTranslation(id: number, updateDto: UpdateContentTranslationDto): Promise<ContentTranslation> {
    const contentTranslation = await this.contentTranslationRepository.findOne({ where: { id } });
    if (!contentTranslation) {
      throw new NotFoundException(`Content translation with ID ${id} not found`);
    }
    
    await this.contentTranslationRepository.update(id, updateDto);
    return this.contentTranslationRepository.findOne({ where: { id } });
  }

  async syncContentTranslations(contentId: number, sourceLanguageId: number): Promise<void> {
    const content = await this.contentRepository.findOne({ where: { id: contentId } });
    if (!content) {
      throw new NotFoundException(`Content with ID ${contentId} not found`);
    }
    
    const sourceTranslation = await this.contentTranslationRepository.findOne({
      where: { contentId, languageId: sourceLanguageId },
    });
    
    if (!sourceTranslation) {
      throw new NotFoundException(`Source translation not found for content ID ${contentId} and language ID ${sourceLanguageId}`);
    }
    
    const languages = await this.languageRepository.find({
      where: { id: sourceLanguageId },
    });
    
    const sourceLanguage = await this.languageRepository.findOne({ where: { id: sourceLanguageId } });
    
    for (const language of languages) {
      const existingTranslation = await this.contentTranslationRepository.findOne({
        where: { contentId, languageId: language.id },
      });
      
      if (!existingTranslation) {
        // Create a new translation with auto-translation
        const translatedValue = await this.autoTranslationService.translate(
          sourceTranslation.value,
          language.code,
          sourceLanguage.code,
        );
        
        await this.createContentTranslation({
          contentId,
          languageId: language.id,
          value: translatedValue,
          isAutoTranslated: true,
        });
      }
    }
  }
}