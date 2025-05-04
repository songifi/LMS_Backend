import { IsNotEmpty, IsString, IsOptional, IsUrl, IsBoolean, IsObject } from 'class-validator';

export class CreateLtiToolDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  clientId: string;

  @IsNotEmpty()
  @IsString()
  issuer: string;

  @IsNotEmpty()
  @IsString()
  publicKey: string;

  @IsNotEmpty()
  @IsString()
  privateKey: string;

  @IsOptional()
  @IsString()
  publicJwk?: string;

  @IsNotEmpty()
  @IsUrl()
  loginUrl: string;

  @IsNotEmpty()
  @IsUrl()
  redirectUrl: string;

  @IsOptional()
  @IsUrl()
  deepLinkingUrl?: string;

  @IsOptional()
  @IsBoolean()
  supportsDeepLinking?: boolean;

  @IsOptional()
  @IsBoolean()
  supportsAgs?: boolean;

  @IsOptional()
  @IsBoolean()
  supportsNrps?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  customParameters?: Record<string, string>;
}

export class UpdateLtiToolDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  issuer?: string;

  @IsOptional()
  @IsString()
  publicKey?: string;

  @IsOptional()
  @IsString()
  privateKey?: string;

  @IsOptional()
  @IsString()
  publicJwk?: string;

  @IsOptional()
  @IsUrl()
  loginUrl?: string;

  @IsOptional()
  @IsUrl()
  redirectUrl?: string;

  @IsOptional()
  @IsUrl()
  deepLinkingUrl?: string;

  @IsOptional()
  @IsBoolean()
  supportsDeepLinking?: boolean;

  @IsOptional()
  @IsBoolean()
  supportsAgs?: boolean;

  @IsOptional()
  @IsBoolean()
  supportsNrps?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  customParameters?: Record<string, string>;
}

export class LtiToolConfigurationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsUrl()
  targetLinkUri: string;

  @IsNotEmpty()
  @IsUrl()
  oidcInitiationUrl: string;

  @IsOptional()
  @IsUrl()
  jwksUrl?: string;

  @IsOptional()
  @IsObject()
  customParameters?: Record<string, string>;

  @IsOptional()
  @IsString({ each: true })
  claims?: string[];

  @IsOptional()
  @IsBoolean()
  supportsDeepLinking?: boolean;

  @IsOptional()
  @IsBoolean()
  supportsAgs?: boolean;

  @IsOptional()
  @IsBoolean()
  supportsNrps?: boolean;
}