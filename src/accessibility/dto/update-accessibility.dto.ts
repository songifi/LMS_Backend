import { PartialType } from '@nestjs/swagger';
import { CreateAccessibilityDto } from './create-accessibility.dto';

export class UpdateAccessibilityDto extends PartialType(CreateAccessibilityDto) {}
