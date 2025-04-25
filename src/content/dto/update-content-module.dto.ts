import { PartialType } from '@nestjs/mapped-types';
import { CreateContentModuleDto } from './create-content-module.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateContentModuleDto extends PartialType(CreateContentModuleDto) {
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
