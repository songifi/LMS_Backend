import { PartialType } from '@nestjs/swagger';
import { CreateCurriculumMappingDto } from './create-curriculum-mapping.dto';

export class UpdateCurriculumMappingDto extends PartialType(CreateCurriculumMappingDto) {}
