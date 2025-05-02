import { PartialType } from '@nestjs/swagger';
import { CreatePrivacyDto } from './create-privacy.dto';

export class UpdatePrivacyDto extends PartialType(CreatePrivacyDto) {}
