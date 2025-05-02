import { PartialType } from '@nestjs/swagger';
import { CreateTaskProcessorDto } from './create-task-processor.dto';

export class UpdateTaskProcessorDto extends PartialType(CreateTaskProcessorDto) {}
