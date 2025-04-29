import { PartialType } from '@nestjs/swagger';
import { CreateProgramDto } from './create-academic-program.dto';

export class UpdateProgramDto extends PartialType(CreateProgramDto) {}
