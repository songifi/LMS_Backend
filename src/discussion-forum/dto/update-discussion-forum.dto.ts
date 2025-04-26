import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateForumDto } from './create-discussion-forum.dto';

export class UpdateForumDto extends PartialType(CreateForumDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}