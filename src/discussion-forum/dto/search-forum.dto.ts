import { IsString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

export class SearchForumDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsUUID()
  @IsOptional()
  forumId?: string;

  @IsUUID()
  @IsOptional()
  courseId?: string;
}