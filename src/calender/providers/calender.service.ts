import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Calendar } from '../entities/calender.entity';
import { CreateCalendarDto } from '../dto/create-calender.dto';
import { UpdateCalendarDto } from '../dto/update-calender.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Calendar)
    private calendarRepository: Repository<Calendar>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(userId: number): Promise<Calendar[]> {
    return this.calendarRepository
      .createQueryBuilder('calendar')
      .where('calendar.ownerId = :userId', { userId })
      .orWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('shares.calendar_id')
          .from('calendar_shares', 'shares')
          .where('shares.user_id = :userId')
          .getQuery();
        return 'calendar.id IN ' + subQuery;
      })
      .setParameter('userId', userId)
      .getMany();
  }

  async findOne(id: number, userId: number): Promise<Calendar> {
    const calendar = await this.calendarRepository
      .createQueryBuilder('calendar')
      .leftJoinAndSelect('calendar.sharedWith', 'sharedWith')
      .where('calendar.id = :id', { id })
      .getOne();

    if (!calendar) {
      throw new NotFoundException(`Calendar with ID ${id} not found`);
    }

    // Fix type comparison issue by converting to the same type
    if (
      calendar.ownerId !== userId.toString() &&
      !calendar.isPublic &&
      !calendar.sharedWith.some((user) => user.id === userId)
    ) {
      throw new ForbiddenException('You do not have access to this calendar');
    }

    return calendar;
  }

  async create(createCalendarDto: CreateCalendarDto, user: User): Promise<Calendar> {
    const calendar = this.calendarRepository.create({
      ...createCalendarDto,
      owner: user,
    });

    return this.calendarRepository.save(calendar);
  }

  async update(id: number, updateCalendarDto: UpdateCalendarDto, userId: number): Promise<Calendar> {
    const calendar = await this.findOne(id, userId);

    // Fix type comparison issue by converting to the same type
    if (calendar.ownerId !== userId.toString()) {
      throw new ForbiddenException('Only the owner can update this calendar');
    }

    this.calendarRepository.merge(calendar, updateCalendarDto);
    return this.calendarRepository.save(calendar);
  }

  async remove(id: number, userId: number): Promise<void> {
    const calendar = await this.findOne(id, userId);

    // Fix type comparison issue by converting to the same type
    if (calendar.ownerId !== userId.toString()) {
      throw new ForbiddenException('Only the owner can delete this calendar');
    }

    await this.calendarRepository.remove(calendar);
  }

  async shareCalendar(calendarId: number, userIds: number[], ownerId: number): Promise<Calendar> {
    const calendar = await this.findOne(calendarId, ownerId);

    // Fix type comparison issue by converting to the same type
    if (calendar.ownerId !== ownerId.toString()) {
      throw new ForbiddenException('Only the owner can share this calendar');
    }

    const users = await this.userRepository.findByIds(userIds);

    calendar.sharedWith = [...calendar.sharedWith, ...users];

    return this.calendarRepository.save(calendar);
  }
}