import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from "@nestjs/common"
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard"
import { RolesGuard } from "src/auth/guards/role.guard"
import { Roles } from "src/auth/decorators/roles.decorator"
import { GradeScaleService } from "../providers/grade-scale.service"
import { CreateGradeScaleDto } from "../dto/create-grade-scale.dto"
import { UpdateGradeScaleDto } from "../dto/update-grade-scale.dto"

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("grade-scales")
export class GradeScaleController {
  constructor(private readonly gradeScaleService: GradeScaleService) {}

  @Roles("admin", "instructor")
  @Post()
  create(@Body() createGradeScaleDto: CreateGradeScaleDto) {
    return this.gradeScaleService.create(createGradeScaleDto)
  }

  @Get()
  findAll(@Query("courseId") courseId?: string) {
    return this.gradeScaleService.findAll()
  }

  @Get("default")
  findDefault(@Query("courseId") courseId?: string) {
    return this.gradeScaleService.findDefault()
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.gradeScaleService.findOne(id)
  }

  @Patch(":id")
  @Roles("admin", "instructor")
  update(@Param("id") id: string, @Body() updateGradeScaleDto: UpdateGradeScaleDto) {
    return this.gradeScaleService.update(id, updateGradeScaleDto)
  }

  @Delete(":id")
  @Roles("admin", "instructor")
  remove(@Param("id") id: string) {
    return this.gradeScaleService.remove(id)
  }
}
