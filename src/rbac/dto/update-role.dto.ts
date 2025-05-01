import { PartialType } from '@nestjs/swagger';
import { CreateRbacDto } from './create-role.dto';

export class UpdateRbacDto extends PartialType(CreateRbacDto) {}
