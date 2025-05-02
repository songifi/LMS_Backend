import { PartialType } from '@nestjs/swagger';
import { CreateCdnDto } from './create-cdn.dto';

export class UpdateCdnDto extends PartialType(CreateCdnDto) {}
