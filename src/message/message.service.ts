import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { Announcement } from './entities/announcement.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { SearchMessageDto } from './dto/search-message.dto';


@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(Conversation) private conversationRepo: Repository<Conversation>,
    @InjectRepository(Announcement) private announcementRepo: Repository<Announcement>,
  ) {}

  async create(createMessageDto: CreateMessageDto) {
    const message = this.messageRepo.create(createMessageDto);
    return this.messageRepo.save(message);
  }

  async findAll() {
    return this.messageRepo.find();
  }

  async findOne(id: number) {
    return this.messageRepo.findOne({ where: { id } });
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    await this.messageRepo.update(id, updateMessageDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.messageRepo.delete(id);
    return { deleted: true };
  }

  async getMessages(userId: number) {
    return this.messageRepo.find({ where: [{ senderId: userId }, { receiverId: userId }], relations: ['conversation', 'attachments', 'statuses'] });
  }

  async sendMessage(dto: CreateMessageDto) {
    const message = this.messageRepo.create(dto);
    return this.messageRepo.save(message);
  }

  async getMessage(id: number) {
    return this.messageRepo.findOne({ where: { id }, relations: ['attachments', 'statuses'] });
  }

  async updateMessage(id: number, dto: UpdateMessageDto) {
    const message = await this.messageRepo.findOne({ where: { id } });
    if (!message) return null;
    // Logic to update status
    return message;
  }

  async deleteMessage(id: number) {
    await this.messageRepo.delete(id);
    return { deleted: true };
  }

  async getConversations(userId: number) {
    return this.conversationRepo.find({ where: [{ participantOneId: userId }, { participantTwoId: userId }] });
  }

  async createAnnouncement(dto: CreateAnnouncementDto) {
    const announcement = this.announcementRepo.create(dto);
    return this.announcementRepo.save(announcement);
  }

  async getAnnouncements() {
    return this.announcementRepo.find();
  }

 async search(dto: SearchMessageDto) {
  const where: FindOptionsWhere<Message>[] = [];  // 🛠️ Important: Define proper type

  if (dto.keyword) where.push({ content: ILike(`%${dto.keyword}%`) });
  if (dto.senderId) where.push({ senderId: dto.senderId });
  if (dto.receiverId) where.push({ receiverId: dto.receiverId });

  return this.messageRepo.find({
    where,
    relations: ['sender', 'receiver'], // if you have relations
  });
}
}
