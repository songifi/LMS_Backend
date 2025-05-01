import { Test, TestingModule } from '@nestjs/testing';
import { CourseTemplatesController } from './course-templates.controller';
import { CourseTemplatesService } from './course-templates.service';

describe('CourseTemplatesController', () => {
  let controller: CourseTemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseTemplatesController],
      providers: [CourseTemplatesService],
    }).compile();

    controller = module.get<CourseTemplatesController>(CourseTemplatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
