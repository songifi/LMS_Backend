import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendar } from './entities/calender.entity';
import { EventRecurrence } from './entities/event-recurrence.entity';
import { EventAttendee } from './entities/event-attendee.entity';
import { EventReminder } from './entities/event-reminder.entity';
import { NotificationModule } from './notification.module';
import { CalendarController } from './controllers/calender.controller';
import { EventController } from './controllers/event.controller';
import { CalendarService } from './providers/calender.service';
import { EventService } from './providers/event.service';
import { CalendarSharingService } from './providers/calendar-sharing.service';
import { ICalendarService } from './providers/icalendar.service';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Calendar,
      Event,
      EventRecurrence,
      EventAttendee,
      EventReminder,
      User,
    ]),
    NotificationModule,
  ],
  controllers: [CalendarController, EventController],
  providers: [
    CalendarService,
    EventService,
    CalendarSharingService,
    ICalendarService,
  ],
  exports: [CalendarService, EventService, ICalendarService],
})
export class CalendarModule {}
