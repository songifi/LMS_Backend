import { ApiProperty } from '@nestjs/swagger';

export class SearchMessageDto {
  @ApiProperty({ required: false })
  keyword?: string;

  @ApiProperty({ required: false })
  senderId?: number;

  @ApiProperty({ required: false })
  receiverId?: number;
}
