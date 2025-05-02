import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LanguageService } from '../services/language.service';

@Injectable()
export class RtlSupportInterceptor implements NestInterceptor {
  constructor(private readonly languageService: LanguageService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const languageCode = request.query.lang || 
                         (request.headers['accept-language'] ? 
                          request.headers['accept-language'].split(',')[0].split(';')[0].trim() : 
                          null);

    return next.handle().pipe(
      map(async (data) => {
        // Only process objects
        if (typeof data === 'object' && data !== null) {
          let isRtl = false;

          // Determine if the language is RTL
          if (languageCode) {
            try {
              const language = await this.languageService.findByCode(languageCode);
              isRtl = language.isRtl;
            } catch (error) {
              // Language not found, use default
              const defaultLanguage = await this.languageService.getDefaultLanguage();
              isRtl = defaultLanguage.isRtl;
            }
          } else {
            // No language specified, use default
            const defaultLanguage = await this.languageService.getDefaultLanguage();
            isRtl = defaultLanguage.isRtl;
          }

          // Add RTL information to the response
          return {
            ...data,
            _meta: {
              ...(data._meta || {}),
              isRtl,
            },
          };
        }

        return data;
      }),
    );
  }
}