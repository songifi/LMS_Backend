import { Test, TestingModule } from '@nestjs/testing';
import { MultilingualContentController } from './multilingual-content.controller';
import { MultilingualContentService } from './multilingual-content.service';

describe('MultilingualContentController', () => {
  let controller: MultilingualContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MultilingualContentController],
      providers: [MultilingualContentService],
    }).compile();

    controller = module.get<MultilingualContentController>(MultilingualContentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
