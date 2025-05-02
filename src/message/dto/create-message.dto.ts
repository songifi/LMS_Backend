import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty()
  senderId: number;

  @ApiProperty()
  receiverId: number;

  @ApiProperty()
  content: string;

  @ApiProperty({ required: false })
  conversationId?: number;

  @ApiProperty({ required: false, type: [String] })
  attachments?: string[];
}
