import { Module } from '@nestjs/common';
import { EventSourcingService } from './event-sourcing.service';
import { EventSourcingController } from './event-sourcing.controller';

@Module({
  controllers: [EventSourcingController],
  providers: [EventSourcingService],
})
export class EventSourcingModule {}
