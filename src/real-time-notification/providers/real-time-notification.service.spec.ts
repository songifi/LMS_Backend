import { Test, TestingModule } from '@nestjs/testing';
import { RealTimeNotificationService } from './real-time-notification.service';

describe('RealTimeNotificationService', () => {
  let service: RealTimeNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RealTimeNotificationService],
    }).compile();

    service = module.get<RealTimeNotificationService>(RealTimeNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
