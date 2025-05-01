import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class ApplyTemplateDto {
  @IsUUID()
  @IsNotEmpty()
  templateId: string;

  @IsArray()
  @IsNotEmpty()
  courseIds: string[];
}