import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMailDto {
  @IsOptional()
  @IsBoolean()
  isSent?: boolean;
}
export class UpdateMailStatusDto {
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
export class UpdateMailStarredDto {
  @IsOptional()
  @IsBoolean()
  isStarred?: boolean;
}