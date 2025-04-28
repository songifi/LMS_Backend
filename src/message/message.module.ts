import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { Announcement } from './entities/announcement.entity';
import { MessageAttachment } from './entities/message-attachment.entity';
import { MessageTemplate } from './entities/message-template.entity';
import { MessageStatus } from './entities/message-status.entity';
import { MessageFolder } from './entities/message-folder.entity';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    Message,
    Conversation,
    Announcement,
    MessageAttachment,
    MessageTemplate,
    MessageStatus,
    MessageFolder,
  ])],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
