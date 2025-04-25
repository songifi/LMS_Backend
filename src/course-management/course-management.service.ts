import { Injectable } from '@nestjs/common';
import { CreateCourseManagementDto } from './dto/create-course-management.dto';
import { UpdateCourseManagementDto } from './dto/update-course-management.dto';

@Injectable()
export class CourseManagementService {
  create(createCourseManagementDto: CreateCourseManagementDto) {
    return 'This action adds a new courseManagement';
  }

  findAll() {
    return `This action returns all courseManagement`;
  }

  findOne(id: number) {
    return `This action returns a #${id} courseManagement`;
  }

  update(id: number, updateCourseManagementDto: UpdateCourseManagementDto) {
    return `This action updates a #${id} courseManagement`;
  }

  remove(id: number) {
    return `This action removes a #${id} courseManagement`;
  }
}
