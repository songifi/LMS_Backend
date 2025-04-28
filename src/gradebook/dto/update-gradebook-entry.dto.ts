import { PartialType } from "@nestjs/swagger"
import { CreateGradebookEntryDto } from "./create-gradebook-entry.dto"

export class UpdateGradebookEntryDto extends PartialType(CreateGradebookEntryDto) {}
