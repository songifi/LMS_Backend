import { Controller, Get, Param, UseGuards, Request } from "@nestjs/common"
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard"
import { RolesGuard } from "src/auth/guards/role.guard"
import { Roles } from "src/auth/decorators/roles.decorator"
import { GradeHistoryService } from "../providers/grade-history.service"

@Controller("grade-history")
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradeHistoryController {
  constructor(private readonly gradeHistoryService: GradeHistoryService) {}

  @Get("entry/:entryId")
  findByEntry(@Param("entryId") entryId: string) {
    return this.gradeHistoryService.findByEntry(entryId)
  }

  @Get("course/:courseId")
  @Roles("admin", "instructor")
  findByCourse(@Param("courseId") courseId: string) {
    return this.gradeHistoryService.findByCourse(courseId)
  }

  @Get("student/:studentId")
  findByStudent(@Param("studentId") studentId: string, @Request() req) {
    // If user is a student, only allow them to view their own history
    if (
      req.user.roles.includes("student") &&
      !req.user.roles.includes("instructor") &&
      !req.user.roles.includes("admin")
    ) {
      if (req.user.id !== studentId) {
        throw new Error("You can only view your own grade history")
      }
    }

    return this.gradeHistoryService.findByStudent(studentId)
  }
}
