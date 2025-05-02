import { Test, TestingModule } from '@nestjs/testing';
import { EventSourcingService } from './event-sourcing.service';

describe('EventSourcingService', () => {
  let service: EventSourcingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventSourcingService],
    }).compile();

    service = module.get<EventSourcingService>(EventSourcingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
