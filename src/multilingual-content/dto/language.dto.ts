import { IsString, IsBoolean, IsOptional, Length } from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  @Length(2, 10)
  code: string;

  @IsString()
  @Length(2, 100)
  name: string;

  @IsBoolean()
  @IsOptional()
  isRtl?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateLanguageDto {
  @IsString()
  @IsOptional()
  @Length(2, 10)
  code?: string;

  @IsString()
  @IsOptional()
  @Length(2, 100)
  name?: string;

  @IsBoolean()
  @IsOptional()
  isRtl?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}