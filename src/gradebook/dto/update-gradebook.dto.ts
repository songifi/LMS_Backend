import { PartialType } from "@nestjs/swagger"
import { CreateGradebookDto } from "./create-gradebook.dto"

export class UpdateGradebookDto extends PartialType(CreateGradebookDto) {}
