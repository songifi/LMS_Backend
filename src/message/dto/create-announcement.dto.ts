import { ApiProperty } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;
}
