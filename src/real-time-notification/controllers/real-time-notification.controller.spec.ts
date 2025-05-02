import { Test, TestingModule } from '@nestjs/testing';
import { RealTimeNotificationController } from './real-time-notification.controller';
import { RealTimeNotificationService } from './real-time-notification.service';

describe('RealTimeNotificationController', () => {
  let controller: RealTimeNotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RealTimeNotificationController],
      providers: [RealTimeNotificationService],
    }).compile();

    controller = module.get<RealTimeNotificationController>(RealTimeNotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
