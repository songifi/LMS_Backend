import { PartialType } from '@nestjs/mapped-types';
import { CreateContentDto } from './create-content.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateContentDto extends PartialType(CreateContentDto) {
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsOptional()
  orderIndex?: number;
}
