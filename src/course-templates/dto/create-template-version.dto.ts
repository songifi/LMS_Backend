import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTemplateVersionDto {
  @IsString()
  @IsNotEmpty()
  versionNumber: string;

  @IsObject()
  @IsNotEmpty()
  templateData: Record<string, any>;

  @IsString()
  @IsOptional()
  changeLog?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID()
  @IsNotEmpty()
  templateId: string;
}
