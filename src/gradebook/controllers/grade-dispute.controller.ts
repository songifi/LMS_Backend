import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from "@nestjs/common"
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard"
import { RolesGuard } from "src/auth/guards/role.guard"
import { Roles } from "src/auth/decorators/roles.decorator"
import { GradeDisputeService } from "../providers/grade-dispute.service"
import { CreateGradeDisputeDto } from "../dto/create-grade-dispute.dto"
import { UpdateGradeDisputeDto } from "../dto/update-grade-dispute.dto"

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("grade-disputes")
export class GradeDisputeController {
  constructor(private readonly gradeDisputeService: GradeDisputeService) {}

  @Post()
  create(@Body() createGradeDisputeDto: CreateGradeDisputeDto, @Request() req) {
    return this.gradeDisputeService.create(createGradeDisputeDto, req.user)
  }

  @Get()
  findAll(
    @Request() req,
    @Query("status") status?: string,
    @Query("courseId") courseId?: string,
    @Query("studentId") studentId?: string,
  ) {
    // If user is a student, only return their own disputes
    if (
      req.user.roles.includes("student") &&
      !req.user.roles.includes("instructor") &&
      !req.user.roles.includes("admin")
    ) {
      return this.gradeDisputeService.findAll(status, courseId, req.user.id);
    }
  
    return this.gradeDisputeService.findAll(status, courseId, studentId);
  }
  
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.gradeDisputeService.findOne(id);
  }

  @Patch(":id")
  @Roles("admin", "instructor")
  update(@Param("id") id: string, @Body() updateGradeDisputeDto: UpdateGradeDisputeDto, @Request() req) {
    return this.gradeDisputeService.update(id, updateGradeDisputeDto, req.user)
  }

  @Delete(":id")
  @Roles("admin", "instructor")
  remove(@Param("id") id: string) {
    return this.gradeDisputeService.remove(id);
  }
}
