import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateContentModuleDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  orderIndex?: number;

  @IsUUID()
  @IsOptional()
  parentModuleId?: string;
  
}