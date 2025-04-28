import { PartialType } from '@nestjs/mapped-types';
import { CreateGradeCategoryDto } from './create-grade-category.dto';

export class UpdateGradeCategoryDto extends PartialType(CreateGradeCategoryDto) {}
