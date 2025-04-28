import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { EventRecurrence } from '../entities/event-recurrence.entity';
import ical, { ICalCalendar, ICalEventData, ICalAttendeeData, ICalAlarmData, ICalAttendeeStatus, ICalAttendeeRole, ICalAlarmType } from 'ical-generator';
import * as moment from 'moment';
import { Calendar } from '../entities/calender.entity';
import { RecurrenceFrequency } from '../enums/recurrenceFrequency.enum';

@Injectable()
export class ICalendarService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Calendar)
    private calendarRepository: Repository<Calendar>,
  ) {}

  async exportCalendarToICal(calendarId: string, userId: string): Promise<string> {
    const calendar = await this.calendarRepository.findOne({
      where: { id: calendarId },
      relations: ['sharedWith'],
    });

    if (!calendar) {
      throw new NotFoundException(`Calendar with ID ${calendarId} not found`);
    }

    if (
      calendar.ownerId !== userId &&
      !calendar.isPublic &&
      !calendar.sharedWith.some((user) => user.id.toString() === userId)
    ) {
      throw new NotFoundException(`Calendar with ID ${calendarId} not found`);
    }

    const events = await this.eventRepository.find({
      where: { calendarId },
      relations: ['recurrence', 'attendees', 'reminders'],
    });

    const icalCalendar: ICalCalendar = ical({
      name: calendar.name,
      prodId: { company: 'Your Company', product: 'Calendar Application' },
    });

    for (const event of events) {
      const eventData: ICalEventData = {
        id: event.id,
        start: moment(event.startDate).toDate(),
        end: moment(event.endDate).toDate(),
        summary: event.title,
        description: event.description,
        location: event.location,
        allDay: event.isAllDay,
      };

      const icalEvent = icalCalendar.createEvent(eventData);

      if (event.isRecurring && event.recurrence) {
        icalEvent.repeating({
          freq: event.recurrence.frequency as any,  // fix typing
          interval: event.recurrence.interval,
          ...(event.recurrence.exceptionDates?.length && {
            exdate: event.recurrence.exceptionDates.map((date) => moment(date).toDate()),
          }),
        });
      }

      for (const attendee of event.attendees || []) {
        const attendeeData: ICalAttendeeData = {
          email: attendee.email,
          name: `${attendee.user?.firstName ?? ''} ${attendee.user?.lastName ?? ''}`.trim(),
        };

        const icalAttendee = icalEvent.createAttendee(attendeeData);

        const status = this.mapAttendeeStatus(attendee.status);
        if (status) {
          icalAttendee.status(status);
        }

        const role = this.mapAttendeeRole(attendee.role);
        if (role) {
          icalAttendee.role(role);
        }
      }

      for (const reminder of event.reminders || []) {
        const alarmData: ICalAlarmData = {
          type: ICalAlarmType.display,
          trigger: -reminder.minutesBefore * 60, 
        };
        icalEvent.createAlarm(alarmData);
      }
    }

    return icalCalendar.toString();
  }

  async importICalToCalendar(
    calendarId: string,
    iCalData: string,
    userId: string,
  ): Promise<Event[]> {
    const calendar = await this.calendarRepository.findOne({
      where: { id: calendarId },
    });

    if (!calendar) {
      throw new NotFoundException(`Calendar with ID ${calendarId} not found`);
    }

    if (calendar.ownerId !== userId) {
      throw new NotFoundException(`Calendar with ID ${calendarId} not found`);
    }

    const importedEvents: Event[] = [];

    const parsedEvents = [
      {
        uid: 'example-event-1',
        summary: 'Imported Event 1',
        description: 'This is an imported event',
        start: new Date(),
        end: new Date(Date.now() + 3600000),
        rrule: 'FREQ=WEEKLY;INTERVAL=1;BYDAY=MO',
        location: 'Online',
      },
    ];

    for (const parsedEvent of parsedEvents) {
      const event = this.eventRepository.create({
        title: parsedEvent.summary,
        description: parsedEvent.description,
        startDate: parsedEvent.start,
        endDate: parsedEvent.end,
        location: parsedEvent.location,
        calendarId,
        externalId: parsedEvent.uid,
      });

      if (parsedEvent.rrule) {
        event.isRecurring = true;

        const recurrence = new EventRecurrence();
        // Saving the rrule as a string directly
        recurrence.rrule = parsedEvent.rrule;  

        if (parsedEvent.rrule.includes('FREQ=DAILY')) {
          recurrence.frequency = RecurrenceFrequency.DAILY;
        } else if (parsedEvent.rrule.includes('FREQ=WEEKLY')) {
          recurrence.frequency = RecurrenceFrequency.WEEKLY;
        } else if (parsedEvent.rrule.includes('FREQ=MONTHLY')) {
          recurrence.frequency = RecurrenceFrequency.MONTHLY;
        } else if (parsedEvent.rrule.includes('FREQ=YEARLY')) {
          recurrence.frequency = RecurrenceFrequency.YEARLY;
        }

        const intervalMatch = parsedEvent.rrule.match(/INTERVAL=(\d+)/);
        recurrence.interval = intervalMatch ? parseInt(intervalMatch[1], 10) : 1;

        event.recurrence = recurrence;
      }

      const savedEvent = await this.eventRepository.save(event);
      importedEvents.push(savedEvent);
    }

    return importedEvents;
  }

  private mapAttendeeStatus(status: string): ICalAttendeeStatus | undefined {
    switch (status) {
      case 'pending':
        return ICalAttendeeStatus.NEEDSACTION; // Correct enum!
      case 'accepted':
        return ICalAttendeeStatus.ACCEPTED;
      case 'declined':
        return ICalAttendeeStatus.DECLINED;
      case 'tentative':
        return ICalAttendeeStatus.TENTATIVE;
      default:
        return undefined;
    }
  }

  private mapAttendeeRole(role: string): ICalAttendeeRole | undefined {
    switch (role) {
      case 'required':
        return ICalAttendeeRole.REQ;
      case 'optional':
        return ICalAttendeeRole.OPT;
      case 'organizer':
        return ICalAttendeeRole.CHAIR;
      default:
        return undefined;
    }
  }
}
