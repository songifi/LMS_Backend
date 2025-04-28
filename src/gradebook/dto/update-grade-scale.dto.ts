import { PartialType } from "@nestjs/swagger"
import { CreateGradeScaleDto } from "./create-grade-scale.dto"

export class UpdateGradeScaleDto extends PartialType(CreateGradeScaleDto) {}
