import { IsString, IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ContentType } from '../entities/content.entity';

export class CreateContentDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ContentType)
  contentType: ContentType;

  @IsUUID()
  @IsOptional()
  moduleId?: string;

  @IsArray()
  @IsOptional()
  prerequisites?: string[];

  @IsArray()
  @IsOptional()
  metadata?: { key: string; value: string; isSearchable?: boolean }[];
}
