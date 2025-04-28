import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/role.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { GradeCategoryService } from "../providers/grade-category.service";
import { CreateGradeCategoryDto } from "../dto/create-grade-category.dto";
import { UpdateGradeCategoryDto } from "../dto/update-grade-category.dto";

@Controller("grade-categories")
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradeCategoryController {
  constructor(private readonly gradeCategoryService: GradeCategoryService) {}

  @Post()
  @Roles("admin", "instructor")
  create(@Body() createGradeCategoryDto: CreateGradeCategoryDto) {
    return this.gradeCategoryService.create(createGradeCategoryDto);
  }

  @Get()
  findAll() {
    return this.gradeCategoryService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.gradeCategoryService.findOne(id);
  }

  @Patch(":id")
  @Roles("admin", "instructor")
  update(@Param("id") id: string, @Body() updateGradeCategoryDto: UpdateGradeCategoryDto) {
    return this.gradeCategoryService.update(id, updateGradeCategoryDto);
  }

  @Delete(":id")
  @Roles("admin", "instructor")
  remove(@Param("id") id: string) {
    return this.gradeCategoryService.remove(id);
  }

  @Get("validate")
  @Roles("admin", "instructor")
  validateWeights() {
    return this.gradeCategoryService.validateCategoryWeights();
  }
}
