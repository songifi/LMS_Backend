import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLanguagePreference } from '../entities/user-language-preference.entity';
import { Language } from '../entities/language.entity';
import { SetUserLanguagePreferenceDto } from '../dto/user-language-preference.dto';

@Injectable()
export class UserLanguagePreferenceService {
  constructor(
    @InjectRepository(UserLanguagePreference)
    private userLanguagePreferenceRepository: Repository<UserLanguagePreference>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
  ) {}

  async getUserLanguagePreferences(userId: number): Promise<UserLanguagePreference[]> {
    return this.userLanguagePreferenceRepository.find({
      where: { userId },
      relations: ['language'],
    });
  }

  async getUserPrimaryLanguage(userId: number): Promise<Language> {
    const preference = await this.userLanguagePreferenceRepository.findOne({
      where: { userId, isPrimary: true },
      relations: ['language'],
    });
    
    if (preference) {
      return preference.language;
    }
    
    // Return default language if no preference is set
    return this.languageRepository.findOne({ where: { isDefault: true } });
  }

  async setUserLanguagePreference(dto: SetUserLanguagePreferenceDto): Promise<UserLanguagePreference> {
    const language = await this.languageRepository.findOne({ where: { id: dto.languageId } });
    if (!language) {
      throw new NotFoundException(`Language with ID ${dto.languageId} not found`);
    }
    
    // If setting as primary, unset any existing primary preference
    if (dto.isPrimary) {
      await this.userLanguagePreferenceRepository.update(
        { userId: dto.userId, isPrimary: true },
        { isPrimary: false }
      );
    }
    
    // Check if preference already exists
    let preference = await this.userLanguagePreferenceRepository.findOne({
      where: { userId: dto.userId, languageId: dto.languageId },
    });
    
    if (preference) {
      // Update existing preference
      preference.isPrimary = dto.isPrimary;
      return this.userLanguagePreferenceRepository.save(preference);
    } else {
      // Create new preference
      preference = this.userLanguagePreferenceRepository.create({
        userId: dto.userId,
        languageId: dto.languageId,
        isPrimary: dto.isPrimary,
      });
      return this.userLanguagePreferenceRepository.save(preference);
    }
  }

  async removeUserLanguagePreference(userId: number, languageId: number): Promise<void> {
    const preference = await this.userLanguagePreferenceRepository.findOne({
      where: { userId, languageId },
    });
    
    if (!preference) {
      throw new NotFoundException(`Language preference not found for user ID ${userId} and language ID ${languageId}`);
    }
    
    await this.userLanguagePreferenceRepository.remove(preference);
  }
}