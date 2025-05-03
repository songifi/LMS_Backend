import { registerAs } from '@nestjs/config';

export default registerAs('localization', () => ({
  defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en',
  googleTranslateApiKey: process.env.GOOGLE_TRANSLATE_API_KEY,
  supportedLanguages: (process.env.SUPPORTED_LANGUAGES || 'en,es,fr,de,ar').split(','),
  rtlLanguages: (process.env.RTL_LANGUAGES || 'ar,he,fa').split(','),
}));