import { IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class SetUserLanguagePreferenceDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  languageId: number;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean = false;
}