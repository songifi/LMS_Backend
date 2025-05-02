import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { LanguageService } from '../services/language.service';
import { TranslationService } from '../services/translation.service';
import { ContentTranslationService } from '../services/content-translation.service';
import { UserLanguagePreferenceService } from '../services/user-language-preference.service';
import { RegionService } from '../services/region.service';
import { Language } from '../entities/language.entity';
import { SetUserLanguagePreferenceDto } from '../dto/user-language-preference.dto';
import { UserLanguagePreference } from '../entities/user-language-preference.entity';

@Controller('localization')
export class LocalizationController {
  constructor(
    private readonly languageService: LanguageService,
    private readonly translationService: TranslationService,
    private readonly contentTranslationService: ContentTranslationService,
    private readonly userLanguagePreferenceService: UserLanguagePreferenceService,
    private readonly regionService: RegionService,
  ) {}

  @Get('user/:userId/preferences')
  getUserLanguagePreferences(@Param('userId', ParseIntPipe) userId: number): Promise<UserLanguagePreference[]> {
    return this.userLanguagePreferenceService.getUserLanguagePreferences(userId);
  }

  @Get('user/:userId/primary-language')
  getUserPrimaryLanguage(@Param('userId', ParseIntPipe) userId: number): Promise<Language> {
    return this.userLanguagePreferenceService.getUserPrimaryLanguage(userId);
  }

  @Post('user/preferences')
  setUserLanguagePreference(@Body() dto: SetUserLanguagePreferenceDto): Promise<UserLanguagePreference> {
    return this.userLanguagePreferenceService.setUserLanguagePreference(dto);
  }

  @Get('translations')
  async getTranslations(
    @Query('languageCode') languageCode: string,
    @Query('userId') userId?: number,
    @Query('regionCode') regionCode?: string,
  ): Promise<Record<string, string>> {
    let language: Language;

    // Determine language based on user preference, region, or default
    if (userId) {
      language = await this.userLanguagePreferenceService.getUserPrimaryLanguage(userId);
    } else if (regionCode) {
      const region = await this.regionService.findRegionByCode(regionCode);
      language = await this.regionService.getRegionDefaultLanguage(region.id);
    } else if (languageCode) {
      language = await this.languageService.findByCode(languageCode);
    } else {
      language = await this.languageService.getDefaultLanguage();
    }

    // Get all translations for the determined language
    const translations = await this.translationService.findAll(language.id);

    // Convert to key-value format
    const result: Record<string, string> = {};
    for (const translation of translations) {
      result[translation.key] = translation.value;
    }

    return result;
  }
}