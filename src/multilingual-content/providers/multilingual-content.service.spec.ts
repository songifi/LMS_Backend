import { Test, TestingModule } from '@nestjs/testing';
import { MultilingualContentService } from './multilingual-content.service';

describe('MultilingualContentService', () => {
  let service: MultilingualContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MultilingualContentService],
    }).compile();

    service = module.get<MultilingualContentService>(MultilingualContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
