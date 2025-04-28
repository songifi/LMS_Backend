import { IsArray, IsUUID } from 'class-validator';

export class ShareCalendarDto {
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[];
}
