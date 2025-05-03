import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateContentDto {
  @IsString()
  type: string;

  @IsString()
  identifier: string;
}

export class CreateContentTranslationDto {
  @IsNumber()
  contentId: number;

  @IsNumber()
  languageId: number;

  @IsString()
  value: string;

  @IsBoolean()
  @IsOptional()
  isAutoTranslated?: boolean;
}

export class UpdateContentTranslationDto {
  @IsString()
  @IsOptional()
  value?: string;

  @IsBoolean()
  @IsOptional()
  isAutoTranslated?: boolean;
}