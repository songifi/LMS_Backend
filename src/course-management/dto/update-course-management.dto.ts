import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseManagementDto } from './create-course-management.dto';

export class UpdateCourseManagementDto extends PartialType(CreateCourseManagementDto) {}
