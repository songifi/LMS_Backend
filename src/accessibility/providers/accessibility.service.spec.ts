import { Test, TestingModule } from '@nestjs/testing';
import { AccessibilityService } from './accessibility.service';

describe('AccessibilityService', () => {
  let service: AccessibilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessibilityService],
    }).compile();

    service = module.get<AccessibilityService>(AccessibilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
