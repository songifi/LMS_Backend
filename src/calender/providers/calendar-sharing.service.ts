import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Calendar } from '../entities/calender.entity';
import { User } from 'src/user/entities/user.entity';
import { ShareCalendarDto } from '../dto/share-calendar.dto';

@Injectable()
export class CalendarSharingService {
  constructor(
    @InjectRepository(Calendar)
    private calendarRepository: Repository<Calendar>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async shareCalendar(
    calendarId: string,
    shareCalendarDto: ShareCalendarDto,
    userId: string,
  ): Promise<Calendar> {
    const calendar = await this.calendarRepository.findOne({
      where: { id: calendarId },
      relations: ['sharedWith'],
    });

    if (!calendar) {
      throw new NotFoundException(`Calendar with ID ${calendarId} not found`);
    }

    if (calendar.ownerId !== userId) {
      throw new ForbiddenException('Only the calendar owner can share it');
    }

    const usersToShare = await this.userRepository.find({
      where: { id: In(shareCalendarDto.userIds) },
    });

    if (usersToShare.length !== shareCalendarDto.userIds.length) {
      throw new NotFoundException('One or more users not found');
    }

    if (!calendar.sharedWith) {
      calendar.sharedWith = [];
    }

    for (const user of usersToShare) {
      if (!calendar.sharedWith.some(u => u.id.toString() === user.id.toString())) {
        calendar.sharedWith.push(user);
      }
    }

    return this.calendarRepository.save(calendar);
  }

  async removeSharing(
    calendarId: string,
    userId: string,
    targetUserId: string,
  ): Promise<Calendar> {
    const calendar = await this.calendarRepository.findOne({
      where: { id: calendarId },
      relations: ['sharedWith'],
    });

    if (!calendar) {
      throw new NotFoundException(`Calendar with ID ${calendarId} not found`);
    }

    if (calendar.ownerId !== userId) {
      throw new ForbiddenException('Only the calendar owner can modify sharing');
    }

    // Corrected: Remove the user
    calendar.sharedWith = calendar.sharedWith.filter(user => user.id.toString() !== targetUserId);

    return this.calendarRepository.save(calendar);
  }

  async getSharedUsers(calendarId: string, userId: string): Promise<User[]> {
    const calendar = await this.calendarRepository.findOne({
      where: { id: calendarId },
      relations: ['sharedWith'],
    });

    if (!calendar) {
      throw new NotFoundException(`Calendar with ID ${calendarId} not found`);
    }

    if (calendar.ownerId !== userId &&
        !calendar.sharedWith.some(user => user.id.toString() === userId)) {
      throw new ForbiddenException('You do not have access to this calendar');
    }

    return calendar.sharedWith;
  }
}
