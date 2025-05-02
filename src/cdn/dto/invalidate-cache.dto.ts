import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class InvalidateCacheDto {
  @IsString()
  @IsNotEmpty()
  pattern: string;

  @IsString()
  @IsOptional()
  region?: string;
}