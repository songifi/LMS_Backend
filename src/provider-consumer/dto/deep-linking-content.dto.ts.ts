import { IsNotEmpty, IsString, IsOptional, IsUrl, IsBoolean, IsNumber, IsArray, IsObject } from 'class-validator';

export class DeepLinkingContentItemDto {
  @IsNotEmpty()
  @IsString()
  type: string; // 'link', 'ltiResourceLink', 'file', 'html', 'image'

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsObject()
  iframe?: {
    src: string;
    width?: number;
    height?: number;
  };

  @IsOptional()
  @IsString()
  