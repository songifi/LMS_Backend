import { IsNotEmpty, IsString, IsOptional, IsUrl, IsBoolean, IsObject } from 'class-validator';

export class CreateLtiPlatformDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  issuer: string;

  @IsNotEmpty()
  @IsUrl()
  authenticationEndpoint: string;

  @IsNotEmpty()
  @IsUrl()
  accessTokenEndpoint: string;

  @IsNotEmpty()
  @IsUrl()
  jwksEndpoint: string;

  @IsOptional()
  @IsObject()
  jwks?: Record<string, any>;

  @IsNotEmpty()
  @IsString()
  clientId: string;

  @IsOptional()
  @IsString()
  authConfig?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateLtiPlatformDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  issuer?: string;

  @IsOptional()
  @IsUrl()
  authenticationEndpoint?: string;

  @IsOptional()
  @IsUrl()
  accessTokenEndpoint?: string;

  @IsOptional()
  @IsUrl()
  jwksEndpoint?: string;

  @IsOptional()
  @IsObject()
  jwks?: Record<string, any>;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  authConfig?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}