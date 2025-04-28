import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard"
import { RolesGuard } from "src/auth/guards/role.guard"
import { Roles } from "src/auth/decorators/roles.decorator"
import { GradebookService } from "../providers/gradebook.service"
import { CreateGradebookDto } from "../dto/create-gradebook.dto"
import { UpdateGradebookDto } from "../dto/update-gradebook.dto"

@Controller("gradebook")
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradebookController {
  constructor(private readonly gradebookService: GradebookService) {}

  @Post()
  @Roles("admin", "instructor")
  create(@Body() createGradebookDto: CreateGradebookDto) {
    return this.gradebookService.create(createGradebookDto);
  }

  @Get()
  @Roles("admin", "instructor")
  findAll() {
    return this.gradebookService.findAll()
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.gradebookService.findOne(id)
  }

  @Patch(":id")
  @Roles("admin", "instructor")
  update(@Param("id") id: string, @Body() updateGradebookDto: UpdateGradebookDto) {
    return this.gradebookService.update(id, updateGradebookDto)
  }

  @Delete(":id")
  @Roles("admin", "instructor")
  remove(@Param("id") id: string) {
    return this.gradebookService.remove(id)
  }
}
