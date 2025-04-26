import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTopicDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUUID()
  forumId: string;
}
