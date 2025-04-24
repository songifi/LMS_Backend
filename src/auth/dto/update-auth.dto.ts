import { PartialType } from '@nestjs/mapped-types';
import { RegisterDto as CreateAuthDto } from './auth.dto';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}
