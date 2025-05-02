import { PartialType } from '@nestjs/swagger';
import { CreateWebAppDto } from './create-web-app.dto';

export class UpdateWebAppDto extends PartialType(CreateWebAppDto) {}
