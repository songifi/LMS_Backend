import { PartialType } from '@nestjs/swagger';
import { CreateGraphQlFederationDto } from './create-graph-ql-federation.dto';

export class UpdateGraphQlFederationDto extends PartialType(CreateGraphQlFederationDto) {}
