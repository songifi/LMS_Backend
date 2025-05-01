import { Test, TestingModule } from '@nestjs/testing';
import { MfaController } from './mfa.controller';
import { MfaService } from './mfa.service';

describe('MfaController', () => {
  let controller: MfaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MfaController],
      providers: [MfaService],
    }).compile();

    controller = module.get<MfaController>(MfaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
