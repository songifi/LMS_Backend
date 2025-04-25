import { Test, TestingModule } from '@nestjs/testing';
import { CourseManagementService } from './course-management.service';

describe('CourseManagementService', () => {
  let service: CourseManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseManagementService],
    }).compile();

    service = module.get<CourseManagementService>(CourseManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
