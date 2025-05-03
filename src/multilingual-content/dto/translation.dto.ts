import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateTranslationDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsNumber()
  languageId: number;

  @IsBoolean()
  @IsOptional()
  isAutoTranslated?: boolean;
}

export class UpdateTranslationDto {
  @IsString()
  @IsOptional()
  key?: string;

  @IsString()
  @IsOptional()
  value?: string;

  @IsNumber()
  @IsOptional()
  languageId?: number;

  @IsBoolean()
  @IsOptional()
  isAutoTranslated?: boolean;
}

export class TranslateTextDto {
  @IsString()
  text: string;

  @IsString()
  targetLanguageCode: string;

  @IsString()
  @IsOptional()
  sourceLanguageCode?: string;
}