import { Controller, Post, Body, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard"
import { RolesGuard } from "src/auth/guards/role.guard"
import { Roles } from "src/auth/decorators/roles.decorator"
import type { ExportGradesDto } from "../dto/export-grades.dto"
import { GradeExportService } from "../grade-export.service"

@Controller("grade-export")
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradeExportController {
  constructor(private readonly gradeExportService: GradeExportService) {}

  @Roles("admin", "instructor")
  @Post()
  exportGrades(@Body() exportGradesDto: ExportGradesDto) {
    return this.gradeExportService.exportGrades(exportGradesDto)
  }
}
