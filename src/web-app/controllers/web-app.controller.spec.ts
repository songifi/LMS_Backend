import { Test, TestingModule } from '@nestjs/testing';
import { WebAppController } from './web-app.controller';
import { WebAppService } from './web-app.service';

describe('WebAppController', () => {
  let controller: WebAppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebAppController],
      providers: [WebAppService],
    }).compile();

    controller = module.get<WebAppController>(WebAppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
