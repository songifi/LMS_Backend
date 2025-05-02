import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventSourcingService } from './event-sourcing.service';
import { CreateEventSourcingDto } from './dto/create-event-sourcing.dto';
import { UpdateEventSourcingDto } from './dto/update-event-sourcing.dto';

@Controller('event-sourcing')
export class EventSourcingController {
  constructor(private readonly eventSourcingService: EventSourcingService) {}

  @Post()
  create(@Body() createEventSourcingDto: CreateEventSourcingDto) {
    return this.eventSourcingService.create(createEventSourcingDto);
  }

  @Get()
  findAll() {
    return this.eventSourcingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventSourcingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventSourcingDto: UpdateEventSourcingDto) {
    return this.eventSourcingService.update(+id, updateEventSourcingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventSourcingService.remove(+id);
  }
}
