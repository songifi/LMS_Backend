import { Test, TestingModule } from '@nestjs/testing';
import { WebAppService } from './web-app.service';

describe('WebAppService', () => {
  let service: WebAppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebAppService],
    }).compile();

    service = module.get<WebAppService>(WebAppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
