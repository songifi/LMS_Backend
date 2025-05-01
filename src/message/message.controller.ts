import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { SearchMessageDto } from './dto/search-message.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Messages')
@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('/messages')
  @ApiOperation({ summary: 'Get user messages' })
  getMessages(@Query('userId') userId: number) {
    return this.messageService.getMessages(userId);
  }

  @Post('/messages')
  @ApiOperation({ summary: 'Send a new message' })
  sendMessage(@Body() dto: CreateMessageDto) {
    return this.messageService.sendMessage(dto);
  }

  @Get('/messages/:id')
  @ApiOperation({ summary: 'Get message details' })
  getMessage(@Param('id') id: number) {
    return this.messageService.getMessage(id);
  }

  @Put('/messages/:id')
  @ApiOperation({ summary: 'Update message status' })
  updateMessage(@Param('id') id: number, @Body() dto: UpdateMessageDto) {
    return this.messageService.updateMessage(id, dto);
  }

  @Delete('/messages/:id')
  @ApiOperation({ summary: 'Delete a message' })
  deleteMessage(@Param('id') id: number) {
    return this.messageService.deleteMessage(id);
  }

  @Get('/conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  getConversations(@Query('userId') userId: number) {
    return this.messageService.getConversations(userId);
  }

  @Post('/announcements')
  @ApiOperation({ summary: 'Create a new announcement' })
  createAnnouncement(@Body() dto: CreateAnnouncementDto) {
    return this.messageService.createAnnouncement(dto);
  }

  @Get('/announcements')
  @ApiOperation({ summary: 'Get all announcements' })
  getAnnouncements() {
    return this.messageService.getAnnouncements();
  }

  @Get('/messages/search')
  @ApiOperation({ summary: 'Search for messages' })
  searchMessages(@Query() dto: SearchMessageDto) {
    return this.messageService.searchMessages(dto);
  }
}
