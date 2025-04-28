import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DateRangeDto, UpdateEventDto } from '../dto/update-event.dto';
import { Event } from '../entities/event.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EventService } from '../providers/event.service';
import { CreateEventAttendeeDto } from '../dto/CreateEventAttendeeDto';
import { CreateEventDto } from '../dto/create-event.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('calendars/:calendarId/events')
// In the controller
@Get('calendars/:calendarId/events')
async findEventsByCalendar(
  @Param('calendarId') calendarId: string,
  @Query() dateRangeDto: DateRangeDto,
  @Request() req,
): Promise<Event[]> {
  return this.eventService.findEventsByCalendar(
    calendarId,
    req.user.id,
    dateRangeDto.startDate?.toISOString(), // Convert Date to string
    dateRangeDto.endDate?.toISOString(),   // Convert Date to string
  );
}

// In your controller
@Post('calendars/:calendarId/events')
async create(
  @Param('calendarId') calendarId: string,
  @Body() createEventDto: CreateEventDto, // Change the type here
  @Request() req,
): Promise<Event> {
  // Ensure the calendarId from the URL is used
  createEventDto.calendarId = calendarId;
  return this.eventService.create(createEventDto, req.user.id);
}

  @Get('events/:id')
  async findOne(@Param('id') id: string, @Request() req): Promise<Event> {
    return this.eventService.findOne(id, req.user.id);
  }

  @Put('events/:id')
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req,
  ): Promise<Event> {
    return this.eventService.update(id, updateEventDto, req.user.id);
  }

  @Delete('events/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.eventService.remove(id, req.user.id);
  }
}