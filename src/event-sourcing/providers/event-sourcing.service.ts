import { Injectable } from '@nestjs/common';
import { CreateEventSourcingDto } from './dto/create-event-sourcing.dto';
import { UpdateEventSourcingDto } from './dto/update-event-sourcing.dto';

@Injectable()
export class EventSourcingService {
  create(createEventSourcingDto: CreateEventSourcingDto) {
    return 'This action adds a new eventSourcing';
  }

  findAll() {
    return `This action returns all eventSourcing`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventSourcing`;
  }

  update(id: number, updateEventSourcingDto: UpdateEventSourcingDto) {
    return `This action updates a #${id} eventSourcing`;
  }

  remove(id: number) {
    return `This action removes a #${id} eventSourcing`;
  }
}
