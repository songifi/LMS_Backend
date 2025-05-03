import { IsString, IsNumber, IsBoolean, IsOptional, Length } from 'class-validator';

export class CreateRegionDto {
  @IsString()
  @Length(2, 10)
  code: string;

  @IsString()
  @Length(2, 100)
  name: string;
}

export class UpdateRegionDto {
  @IsString()
  @IsOptional()
  @Length(2, 10)
  code?: string;

  @IsString()
  @IsOptional()
  @Length(2, 100)
  name?: string;
}

export class SetRegionLanguageDto {
  @IsNumber()
  regionId: number;

  @IsNumber()
  languageId: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;
}