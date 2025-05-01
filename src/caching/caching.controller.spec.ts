import { Test, TestingModule } from '@nestjs/testing';
import { CachingController } from './caching.controller';
import { CachingService } from './services/caching.service';

describe('CachingController', () => {
  let controller: CachingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CachingController],
      providers: [CachingService],
    }).compile();

    controller = module.get<CachingController>(CachingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
