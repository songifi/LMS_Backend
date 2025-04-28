import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from "@nestjs/common"
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard"
import { RolesGuard } from "src/auth/guards/role.guard"
import { Roles } from "src/auth/decorators/roles.decorator"
import { GradeCurveService } from "../providers/grade-curve.service"
import { CreateGradeCurveDto } from "../dto/create-grade-curve.dto"
import { UpdateGradeCurveDto } from "../dto/update-grade-curve.dto"

@Controller("grade-curves")
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradeCurveController {
  constructor(private readonly gradeCurveService: GradeCurveService) {}

  @Roles("admin", "instructor")
  @Post()
  create(@Body() createGradeCurveDto: CreateGradeCurveDto) {
    return this.gradeCurveService.create(createGradeCurveDto)
  }

  @Get()
  findAll(@Query("courseId") courseId?: string, @Query("assessmentId") assessmentId?: string) {
    return this.gradeCurveService.findAll(courseId)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.gradeCurveService.findOne(id)
  }

  @Patch(":id")
  @Roles("admin", "instructor")
  update(@Param("id") id: string, @Body() updateGradeCurveDto: UpdateGradeCurveDto) {
    return this.gradeCurveService.update(id, updateGradeCurveDto)
  }

  @Delete(":id")
  @Roles("admin", "instructor")
  remove(@Param("id") id: string) {
    return this.gradeCurveService.remove(id)
  }
}
