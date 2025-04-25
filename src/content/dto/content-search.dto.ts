import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ContentType } from '../entities/content.entity';

export class ContentSearchDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsEnum(ContentType, { each: true })
  @IsOptional()
  contentTypes?: ContentType[];

  @IsUUID()
  @IsOptional()
  moduleId?: string;

  @IsString()
  @IsOptional()
  creatorId?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}