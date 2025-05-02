import { Test, TestingModule } from '@nestjs/testing';
import { EventSourcingController } from './event-sourcing.controller';
import { EventSourcingService } from './event-sourcing.service';

describe('EventSourcingController', () => {
  let controller: EventSourcingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventSourcingController],
      providers: [EventSourcingService],
    }).compile();

    controller = module.get<EventSourcingController>(EventSourcingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
