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
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ShareCalendarDto } from '../dto/share-calendar.dto';
import { ICalendarImportDto } from '../dto/icalendar-import.dto';
import { Event } from '../entities/event.entity';
import { CalendarService } from '../providers/calender.service';
import { CalendarSharingService } from '../providers/calendar-sharing.service';
import { ICalendarService } from '../providers/icalendar.service';
import { Calendar } from '../entities/calender.entity';
import { CreateCalendarDto } from '../dto/create-calender.dto';
import { UpdateCalendarDto } from '../dto/update-calender.dto';
import { User } from 'src/user/entities/user.entity';

@Controller('calendars')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly calendarSharingService: CalendarSharingService,
    private readonly iCalendarService: ICalendarService,
  ) {}

  @Get()
  async findAll(@Request() req): Promise<Calendar[]> {
    return this.calendarService.findAll(req.user.id);
  }

  @Post()
  async create(
    @Body() createCalendarDto: CreateCalendarDto,
    @Request() req,
  ): Promise<Calendar> {
    return this.calendarService.create(createCalendarDto, req.user);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<Calendar> {
    return this.calendarService.findOne(id, req.user.id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCalendarDto: UpdateCalendarDto,
    @Request() req,
  ): Promise<Calendar> {
    return this.calendarService.update(id, updateCalendarDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<void> {
    return this.calendarService.remove(id, req.user.id);
  }

  @Post(':id/share')
  async shareCalendar(
    @Param('id') id: string,
    @Body() shareCalendarDto: ShareCalendarDto,
    @Request() req,
  ): Promise<Calendar> {
    return this.calendarSharingService.shareCalendar(
      id,
      shareCalendarDto,
      req.user.id,
    );
  }

  @Delete(':id/share/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSharing(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Request() req,
  ): Promise<void> {
    await this.calendarSharingService.removeSharing(id, req.user.id, targetUserId);
  }

  @Get(':id/shared-users')
  async getSharedUsers(@Param('id') id: string, @Request() req): Promise<User[]> {
    return this.calendarSharingService.getSharedUsers(id, req.user.id);
  }

  @Get(':id/export')
  async exportCalendar(@Param('id') id: string, @Request() req): Promise<string> {
    return this.iCalendarService.exportCalendarToICal(id, req.user.id);
  }

  @Post(':id/import')
  async importCalendar(
    @Param('id') id: string,
    @Body() importDto: ICalendarImportDto,
    @Request() req,
  ): Promise<Event[]> {
    return this.iCalendarService.importICalToCalendar(
      id,
      importDto.iCalData,
      req.user.id,
    );
  }
}
