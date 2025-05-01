import { PartialType } from '@nestjs/swagger';
import { CreateCachingDto } from './create-caching.dto';

export class UpdateCachingDto extends PartialType(CreateCachingDto) {}
