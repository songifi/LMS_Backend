import { PartialType } from "@nestjs/swagger"
import { CreateGradeCurveDto } from "./create-grade-curve.dto"

export class UpdateGradeCurveDto extends PartialType(CreateGradeCurveDto) {}
