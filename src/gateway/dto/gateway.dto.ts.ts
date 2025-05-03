import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsArray, IsNumber, IsDate, ValidateNested } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';

@InputType()
export class CreateGatewayDto {
  @ApiProperty({
    description: 'The name of the gateway',
    example: 'LMS Core API',
  })
  @Field()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The API endpoint',
    example: '/api/lms',
  })
  @Field()
  @IsString()
  endpoint: string;

  @ApiProperty({
    description: 'Is the gateway active',
    example: true,
    default: true,
  })
  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'API version',
    example: 'v1',
    default: 'v1',
  })
  @Field({ defaultValue: 'v1' })
  @IsString()
  @IsOptional()
  version?: string;

  @ApiProperty({
    description: 'Deprecation date for this API version',
    example: '2025-12-31',
    required: false,
  })
  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  deprecationDate?: Date;

  @ApiProperty({
    description: 'Rate limit for this gateway (requests per minute)',
    example: 1000,
    default: 1000,
  })
  @Field(() => Int, { defaultValue: 1000 })
  @IsNumber()
  @IsOptional()
  rateLimit?: number;

  @ApiProperty({
    description: 'Allowed origins for CORS',
    example: ['https://lms.example.com', 'https://api.example.com'],
    type: [String],
  })
  @Field(() => [String])
  @IsArray()
  allowedOrigins: string[];

  @ApiProperty({
    description: 'Supported HTTP methods',
    example: ['GET', 'POST', 'PUT', 'DELETE'],
    type: [String],
  })
  @Field(() => [String])
  @IsArray()
  supportedMethods: string[];

  @ApiProperty({
    description: 'Supported authentication types',
    example: ['basic', 'jwt', 'oauth2'],
    type: [String],
    default: ['basic', 'jwt'],
  })
  @Field(() => [String], { defaultValue: ['basic', 'jwt'] })
  @IsArray()
  @IsOptional()
  authTypes?: string[];

  @ApiProperty({
    description: 'Additional metadata as JSON',
    example: { owner: 'LMS Team', documentation: 'https://docs.example.com/api' },
    type: Object,
    default: {},
  })
  @Field({ defaultValue: {} })
  @IsOptional()
  metaData?: Record<string, any>;
}

@InputType()
export class UpdateGatewayDto {
  @ApiProperty({
    description: 'The name of the gateway',
    example: 'LMS Core API',
    required: false,
  })
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'The API endpoint',
    example: '/api/lms',
    required: false,
  })
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  endpoint?: string;

  @ApiProperty({
    description: 'Is the gateway active',
    example: true,
    required: false,
  })
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'API version',
    example: 'v1',
    required: false,
  })
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  version?: string;

  @ApiProperty({
    description: 'Deprecation date for this API version',
    example: '2025-12-31',
    required: false,
  })
  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  deprecationDate?: Date;

  @ApiProperty({
    description: 'Rate limit for this gateway (requests per minute)',
    example: 1000,
    required: false,
  })
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  rateLimit?: number;

  @ApiProperty({
    description: 'Allowed origins for CORS',
    example: ['https://lms.example.com', 'https://api.example.com'],
    type: [String],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  allowedOrigins?: string[];

  @ApiProperty({
    description: 'Supported HTTP methods',
    example: ['GET', 'POST', 'PUT', 'DELETE'],
    type: [String],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  supportedMethods?: string[];

  @ApiProperty({
    description: 'Supported authentication types',
    example: ['basic', 'jwt', 'oauth2'],
    type: [String],
    required: false,
  })
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  authTypes?: string[];

  @ApiProperty({
    description: 'Additional metadata as JSON',
    example: { owner: 'LMS Team', documentation: 'https://docs.example.com/api' },
    type: Object,
    required: false,
  })
  @Field({ nullable: true })
  @IsOptional()
  metaData?: Record<string, any>;
}

@InputType()
export class GatewayFilterDto {
  @ApiProperty({
    description: 'Filter by version',
    example: 'v1',
    required: false,
  })
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  version?: string;

  @ApiProperty({
    description: 'Filter by active status',
    example: true,
    required: false,
  })
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@InputType()
export class WebhookSubscriptionDto {
  @ApiProperty({
    description: 'The event type to subscribe to',
    example: 'gateway.created',
  })
  @Field()
  @IsString()
  eventType: string;

  @ApiProperty({
    description: 'The endpoint URL to send webhook notifications',
    example: 'https://example.com/webhook',
  })
  @Field()
  @IsString()
  callbackUrl: string;

  @ApiProperty({
    description: 'Optional secret for signing webhook payloads',
    example: 'secret123',
    required: false,
  })
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  secret?: string;
}
