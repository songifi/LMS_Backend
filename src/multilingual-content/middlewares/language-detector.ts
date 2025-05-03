import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LanguageService } from '../services/language.service';

@Injectable()
export class LanguageDetectionMiddleware implements NestMiddleware {
  constructor(private readonly languageService: LanguageService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Try to get language from query parameter
    let languageCode = req.query.lang as string;

    // If not in query, try to get from Accept-Language header
    if (!languageCode && req.headers['accept-language']) {
      const acceptLanguage = req.headers['accept-language'];
      const languages = acceptLanguage.split(',');
      if (languages.length > 0) {
        // Get the first preferred language
        languageCode = languages[0].split(';')[0].trim();
      }
    }

    // If we have a language code, try to find it in our database
    if (languageCode) {
      try {
        const language = await this.languageService.findByCode(languageCode);
        // Attach language to request object for use in controllers
        (req as any).detectedLanguage = language;
      } catch (error) {
        // Language not found, will use default
      }
    }

    // If no language detected or not found, use default
    if (!(req as any).detectedLanguage) {
      const defaultLanguage = await this.languageService.getDefaultLanguage();
      (req as any).detectedLanguage = defaultLanguage;
    }

    next();
  }
}