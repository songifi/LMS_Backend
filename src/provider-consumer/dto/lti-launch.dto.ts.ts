import { IsNotEmpty, IsString, IsOptional, IsObject, IsArray, IsUrl, IsBoolean } from 'class-validator';

export class LtiLaunchDto {
  @IsNotEmpty()
  @IsString()
  iss: string; // Issuer - identifies the platform

  @IsNotEmpty()
  @IsString()
  sub: string; // Subject - identifies the user

  @IsNotEmpty()
  @IsString()
  aud: string; // Audience - identifies the client_id of the tool

  @IsNotEmpty()
  @IsString()
  nonce: string; // Prevents replay attacks

  @IsNotEmpty()
  @IsString()
  exp: string; // Expiration time of the JWT

  @IsNotEmpty()
  @IsString()
  iat: string; // Issued at time of the JWT

  @IsNotEmpty()
  @IsString()
  azp: string; // Authorized party - should equal the aud claim

  @IsNotEmpty()
  @IsString()
  'https://purl.imsglobal.org/spec/lti/claim/message_type': string; // Type of LTI message

  @IsNotEmpty()
  @IsString()
  'https://purl.imsglobal.org/spec/lti/claim/version': string; // LTI version

  @IsNotEmpty()
  @IsString()
  'https://purl.imsglobal.org/spec/lti/claim/deployment_id': string; // Identifies the platform-tool deployment

  @IsOptional()
  @IsString()
  'https://purl.imsglobal.org/spec/lti/claim/target_link_uri'?: string; // The launch URL

  @IsOptional()
  @IsObject()
  'https://purl.imsglobal.org/spec/lti/claim/resource_link'?: {
    id: string;
    title?: string;
    description?: string;
  };

  @IsOptional()
  @IsObject()
  'https://purl.imsglobal.org/spec/lti/claim/context'?: {
    id: string;
    label?: string;
    title?: string;
    type?: string[];
  };

  @IsOptional()
  @IsArray()
  'https://purl.imsglobal.org/spec/lti/claim/roles'?: string[];

  @IsOptional()
  @IsObject()
  'https://purl.imsglobal.org/spec/lti/claim/custom'?: Record<string, string>;

  @IsOptional()
  @IsObject()
  'https://purl.imsglobal.org/spec/lti/claim/lti1p1'?: {
    user_id: string;
    oauth_consumer_key: string;
  };

  @IsOptional()
  @IsObject()
  'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'?: {
    scope: string[];
    lineitem?: string;
    lineitems?: string;
  };

  @IsOptional()
  @IsObject()
  'https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice'?: {
    context_memberships_url: string;
    service_versions: string[];
  };

  @IsOptional()
  @IsObject()
  'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'?: {
    deep_link_return_url: string;
    accept_types: string[];
    accept_media_types?: string;
    accept_presentation_document_targets?: string[];
    accept_multiple?: boolean;
    auto_create?: boolean;
    title?: string;
    text?: string;
    data?: string;
  };

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  given_name?: string;

  @IsOptional()
  @IsString()
  family_name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  picture?: string;
}