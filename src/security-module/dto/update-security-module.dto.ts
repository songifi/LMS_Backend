import { PartialType } from '@nestjs/swagger';
import { CreateSecurityModuleDto } from './create-security-module.dto';

export class UpdateSecurityModuleDto extends PartialType(CreateSecurityModuleDto) {}
