import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseTemplateDto } from './create-course-template.dto';

export class UpdateCourseTemplateDto extends PartialType(CreateCourseTemplateDto) {}
