import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Language } from './entities/language.entity';
import { Translation } from './entities/translation.entity';
import { Content } from './entities/content.entity';
import { ContentTranslation } from './entities/content-translation.entity';
import { UserLanguagePreference } from './entities/user-language-preference.entity';
import { Region } from './entities/region.entity';
import { RegionLanguage } from './entities/region-language.entity';
import { LanguageService } from './services/language.service';
import { TranslationService } from './services/translation.service';
import { ContentTranslationService } from './services/content-translation.service';
import { AutoTranslationService } from './services/auto-translation.service';
import { UserLanguagePreferenceService } from './services/user-language-preference.service';
import { RegionService } from './services/region.service';
import { LocalizationController } from './controllers/localization.controller';
import { LanguageController } from './controllers/language.controller';
import { TranslationController } from './controllers/translation.controller';
import { ContentController } from './controllers/content.controller';
import { RegionController } from './controllers/region.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Language,
      Translation,
      Content,
      ContentTranslation,
      UserLanguagePreference,
      Region,
      RegionLanguage,
    ]),
    HttpModule,
  ],
  controllers: [
    LocalizationController,
    LanguageController,
    TranslationController,
    ContentController,
    RegionController,
  ],
  providers: [
    LanguageService,
    TranslationService,
    ContentTranslationService,
    AutoTranslationService,
    UserLanguagePreferenceService,
    RegionService,
  ],
  exports: [
    LanguageService,
    TranslationService,
    ContentTranslationService,
    UserLanguagePreferenceService,
    RegionService,
  ],
})
export class LocalizationModule {}