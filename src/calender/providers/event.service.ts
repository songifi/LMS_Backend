import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { UpdateEventDto } from '../dto/update-event.dto';
import { Event } from '../entities/event.entity';
import { EventAttendee, AttendeeStatus, AttendeeRole } from '../entities/event-attendee.entity';
import { EventReminder } from '../entities/event-reminder.entity';
import { NotificationService } from '../providers/notification.service';
import { CreateEventDto } from '../dto/create-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventAttendee)
    private readonly attendeeRepository: Repository<EventAttendee>,
    @InjectRepository(EventReminder)
    private readonly reminderRepository: Repository<EventReminder>,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createEventDto: CreateEventDto, userId: string): Promise<Event> {
    // Create event base entity without relations first
    const event = this.eventRepository.create({
      title: createEventDto.title,
      description: createEventDto.description,
      type: createEventDto.type,
      startDate: createEventDto.startDate,
      endDate: createEventDto.endDate,
      isAllDay: createEventDto.isAllDay,
      isRecurring: createEventDto.isRecurring || false,
      location: createEventDto.location,
      color: createEventDto.color,
      calendarId: createEventDto.calendarId,
      isPrivate: createEventDto.isPrivate,
    });
    
    // Save event first to get ID
    const savedEvent = await this.eventRepository.save(event);

    // Handle attendees
    if (createEventDto.attendees && createEventDto.attendees.length > 0) {
      const attendees: EventAttendee[] = [];
      
      for (const attendeeDto of createEventDto.attendees) {
        const attendee = new EventAttendee();
        attendee.eventId = savedEvent.id;
        attendee.userId = attendeeDto.userId || null;
        attendee.email = attendeeDto.email || ''; 

// Similarly for the update function
        attendee.status = attendeeDto.status || AttendeeStatus.PENDING;
        attendee.role = attendeeDto.role || AttendeeRole.REQUIRED;
        attendee.isNotified = false;
        
        attendees.push(attendee);
      }
      
      // Save all attendees
      await this.attendeeRepository.save(attendees);
    }

    // Handle reminders
    if (createEventDto.reminders && createEventDto.reminders.length > 0) {
      const reminders: EventReminder[] = [];
      
      for (const reminderDto of createEventDto.reminders) {
        const reminder = new EventReminder();
        reminder.eventId = savedEvent.id;
        reminder.type = reminderDto.type;
        reminder.minutesBefore = reminderDto.minutesBefore;
        reminder.isSent = false;
        
        if (savedEvent.startDate) {
          const scheduledTime = new Date(savedEvent.startDate);
          scheduledTime.setMinutes(scheduledTime.getMinutes() - reminderDto.minutesBefore);
          reminder.scheduledTime = scheduledTime;
        }
        
        reminders.push(reminder);
      }
      
      // Save all reminders
      await this.reminderRepository.save(reminders);
    }

    // Load the fully populated event
    return this.findOne(savedEvent.id, userId);
  }

  async findEventsByCalendar(
    calendarId: string, 
    userId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<Event[]> {
    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .innerJoinAndSelect('event.calendar', 'calendar')
      .leftJoinAndSelect('calendar.sharedWith', 'sharedWith')
      .leftJoinAndSelect('event.attendees', 'attendees')
      .leftJoinAndSelect('event.reminders', 'reminders')
      .leftJoinAndSelect('event.recurrence', 'recurrence')
      .where('event.calendarId = :calendarId', { calendarId });
    
    // Add date range filtering if provided
    if (startDate) {
      queryBuilder.andWhere('event.startDate >= :startDate', { startDate });
    }
    
    if (endDate) {
      queryBuilder.andWhere('event.endDate <= :endDate', { endDate });
    }
    
    // Check if user has access to the calendar
    queryBuilder.andWhere(
      '(calendar.ownerId = :userId OR sharedWith.userId = :userId OR attendees.userId = :userId)',
      { userId }
    );
    
    return queryBuilder.getMany();
  }

  async findAll(calendarId: string): Promise<Event[]> {
    return this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.attendees', 'attendees')
      .leftJoinAndSelect('event.reminders', 'reminders')
      .leftJoinAndSelect('event.recurrence', 'recurrence')
      .where('event.calendarId = :calendarId', { calendarId })
      .getMany();
  }

  async findOne(id: string, userId: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: [
        'calendar', 
        'calendar.sharedWith', 
        'attendees', 
        'attendees.user', 
        'reminders', 
        'recurrence'
      ],
    } as FindOneOptions<Event>);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const isOwnerOrShared =
    event.calendar.ownerId === userId ||
    event.calendar.sharedWith.some((user) => String(user.id) === userId) ||
    event.attendees.some((attendee) => attendee.userId === userId);

    if (!isOwnerOrShared) {
      throw new ForbiddenException('Access denied');
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto, userId: string): Promise<Event> {
    // First check if the user has access to this event
    const event = await this.findOne(id, userId);
    
    // Update the event properties
    Object.assign(event, {
      title: updateEventDto.title !== undefined ? updateEventDto.title : event.title,
      description: updateEventDto.description !== undefined ? updateEventDto.description : event.description,
      type: updateEventDto.type !== undefined ? updateEventDto.type : event.type,
      startDate: updateEventDto.startDate !== undefined ? updateEventDto.startDate : event.startDate,
      endDate: updateEventDto.endDate !== undefined ? updateEventDto.endDate : event.endDate,
      isAllDay: updateEventDto.isAllDay !== undefined ? updateEventDto.isAllDay : event.isAllDay,
      isRecurring: updateEventDto.isRecurring !== undefined ? updateEventDto.isRecurring : event.isRecurring,
      location: updateEventDto.location !== undefined ? updateEventDto.location : event.location,
      color: updateEventDto.color !== undefined ? updateEventDto.color : event.color,
      isPrivate: updateEventDto.isPrivate !== undefined ? updateEventDto.isPrivate : event.isPrivate,
    });
    
    // Save the updated event
    const updatedEvent = await this.eventRepository.save(event);

    // Handle attendees if provided
    if (updateEventDto.attendees !== undefined) {
      // Remove existing attendees
      await this.attendeeRepository.delete({ eventId: id });
      
      if (updateEventDto.attendees.length > 0) {
        const attendees = updateEventDto.attendees.map(attendeeDto => {
          const attendee = new EventAttendee();
          attendee.eventId = updatedEvent.id;
          attendee.userId = attendeeDto.userId || null; // Or some default value
          attendee.email = attendeeDto.email || ''; // Or some appropriate default

// Similarly for the update function
          attendee.status = attendeeDto.status || AttendeeStatus.PENDING;
          attendee.role = attendeeDto.role || AttendeeRole.REQUIRED;
          attendee.isNotified = false;
          return attendee;
        });
        
        await this.attendeeRepository.save(attendees);
      }
    }

    // Handle reminders if provided
    if (updateEventDto.reminders !== undefined) {
      // Remove existing reminders
      await this.reminderRepository.delete({ eventId: id });
      
      if (updateEventDto.reminders.length > 0) {
        const reminders = updateEventDto.reminders.map(reminderDto => {
          const reminder = new EventReminder();
          reminder.eventId = updatedEvent.id;
          reminder.type = reminderDto.type;
          reminder.minutesBefore = reminderDto.minutesBefore;
          reminder.isSent = false;
          
          if (updatedEvent.startDate) {
            const scheduledTime = new Date(updatedEvent.startDate);
            scheduledTime.setMinutes(scheduledTime.getMinutes() - reminderDto.minutesBefore);
            reminder.scheduledTime = scheduledTime;
          }
          
          return reminder;
        });
        
        await this.reminderRepository.save(reminders);
      }
    }

    // Fetch the fully populated event with relations
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    // First check if the user has access to this event
    const event = await this.findOne(id, userId);
    
    // Delete the event (cascade deletion should handle attendees and reminders)
    await this.eventRepository.remove(event);
  }

  async sendNotificationToUser(userId: string, title: string, message: string): Promise<void> {
    await this.notificationService.sendNotification({
      userId,
      title,
      message,
    });
  }
}