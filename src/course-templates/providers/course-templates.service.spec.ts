import { Test, TestingModule } from '@nestjs/testing';
import { CourseTemplatesService } from './course-templates.service';

describe('CourseTemplatesService', () => {
  let service: CourseTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseTemplatesService],
    }).compile();

    service = module.get<CourseTemplatesService>(CourseTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
