import { IsNotEmpty, IsObject } from 'class-validator';

export class ImportTemplateDto {
  @IsObject()
  @IsNotEmpty()
  templateData: Record<string, any>;
}