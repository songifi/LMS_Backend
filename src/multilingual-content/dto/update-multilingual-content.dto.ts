import { PartialType } from '@nestjs/swagger';
import { CreateMultilingualContentDto } from './create-multilingual-content.dto';

export class UpdateMultilingualContentDto extends PartialType(CreateMultilingualContentDto) {}
