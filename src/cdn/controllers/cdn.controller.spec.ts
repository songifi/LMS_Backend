import { Test, TestingModule } from '@nestjs/testing';
import { CdnController } from './cdn.controller';
import { CdnService } from './cdn.service';

describe('CdnController', () => {
  let controller: CdnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CdnController],
      providers: [CdnService],
    }).compile();

    controller = module.get<CdnController>(CdnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
