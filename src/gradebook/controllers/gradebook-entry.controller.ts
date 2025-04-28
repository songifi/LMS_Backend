import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/role.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { GradebookEntryService } from "../providers/gradebook-entry.service";
import { CreateGradebookEntryDto } from "../dto/create-gradebook-entry.dto";
import { UpdateGradebookEntryDto } from "../dto/update-gradebook-entry.dto";

@Controller("grades")
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradebookEntryController {
  constructor(private readonly gradebookEntryService: GradebookEntryService) {}

  @Post()
  @Roles("admin", "instructor")
  create(@Body() createGradebookEntryDto: CreateGradebookEntryDto, @Request() req) {
    return this.gradebookEntryService.create(createGradebookEntryDto, req.user);
  }

  @Get()
  findAll(@Request() req, 
    @Query("courseId") courseId?: string,
    @Query("studentId") studentId?: string,
    @Query("categoryId") categoryId?: string,
  ) {
    if (
      req.user.roles.includes("student") &&
      !req.user.roles.includes("instructor") &&
      !req.user.roles.includes("admin")
    ) {
      return this.gradebookEntryService.findAll(
        courseId ? Number(courseId) : undefined,
        req.user.id,
        categoryId ? Number(categoryId) : undefined
      );
    }

    return this.gradebookEntryService.findAll(
      courseId ? Number(courseId) : undefined,
      studentId ? Number(studentId) : undefined,
      categoryId ? Number(categoryId) : undefined
    );
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.gradebookEntryService.findOne(Number(id));
  }

  @Patch(":id")
  @Roles("admin", "instructor")
  update(@Param("id") id: string, @Body() updateGradebookEntryDto: UpdateGradebookEntryDto, @Request() req) {
    return this.gradebookEntryService.update(Number(id), updateGradebookEntryDto, req.user);
  }

  @Delete(":id")
  @Roles("admin", "instructor")
  remove(@Param("id") id: string) {
    return this.gradebookEntryService.remove(Number(id));
  }

  @Get(":id/history")
  getHistory(@Param("id") id: string) {
    return this.gradebookEntryService.getGradeHistory(Number(id));
  }

  @Get("calculate/:courseId/:studentId")
  calculateStudentGrades(@Param("courseId") courseId: string, @Param("studentId") studentId: string, @Request() req) {
    if (
      req.user.roles.includes("student") &&
      !req.user.roles.includes("instructor") &&
      !req.user.roles.includes("admin")
    ) {
      if (req.user.id !== Number(studentId)) {
        throw new Error("You can only view your own grades");
      }
    }

    return this.gradebookEntryService.calculateStudentGrades(Number(courseId), Number(studentId));
  }
}
