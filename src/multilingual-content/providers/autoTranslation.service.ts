import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AutoTranslationService {
  private readonly logger = new Logger(AutoTranslationService.name);
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_TRANSLATE_API_KEY');
  }

  async translate(text: string, targetLanguage: string, sourceLanguage: string = 'en'): Promise<string> {
    try {
      if (!this.apiKey) {
        this.logger.warn('Google Translate API key is not configured. Returning original text.');
        return text;
      }

      const url = `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`;
      const response = await firstValueFrom(
        this.httpService.post(url, {
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text',
        })
      );

      if (response.data && 
          response.data.data && 
          response.data.data.translations && 
          response.data.data.translations.length > 0) {
        return response.data.data.translations[0].translatedText;
      }

      return text;
    } catch (error) {
      this.logger.error(`Error translating text: ${error.message}`);
      return text;
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      if (!this.apiKey) {
        this.logger.warn('Google Translate API key is not configured. Returning default language.');
        return 'en';
      }

      const url = `https://translation.googleapis.com/language/translate/v2/detect?key=${this.apiKey}`;
      const response = await firstValueFrom(
        this.httpService.post(url, {
          q: text,
        })
      );

      if (response.data && 
          response.data.data && 
          response.data.data.detections && 
          response.data.data.detections.length > 0 &&
          response.data.data.detections[0].length > 0) {
        return response.data.data.detections[0][0].language;
      }

      return 'en';
    } catch (error) {
      this.logger.error(`Error detecting language: ${error.message}`);
      return 'en';
    }
  }
}