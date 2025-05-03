import { PartialType } from '@nestjs/swagger';
import { CreateEventSourcingDto } from './create-event-sourcing.dto';

export class UpdateEventSourcingDto extends PartialType(CreateEventSourcingDto) {}
