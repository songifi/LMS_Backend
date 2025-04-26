import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  topicId: string;

  @IsUUID()
  @IsOptional()
  replyToId?: string;
}