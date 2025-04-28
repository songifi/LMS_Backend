import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, ForbiddenException } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { FacultyService } from "./faculty.service"
import { RolesGuard } from "src/auth/guards/role.guard"
import { Roles } from "src/auth/decorators/roles.decorator"
import { CurrentUser } from "src/auth/decorators/current-user.decorator"
import { User } from "src/user/entities/user.entity"
import {
  CreateDepartmentDto,
  CreateFacultyDto,
  FacultyAdministratorDto,
  FacultySettingsDto,
  UpdateFacultyDto,
} from "./dto/create-faculty.dto"
import { RoleEnum } from "src/user/role.enum"
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from "@nestjs/swagger"
import { hasRole } from "src/auth/utils/auth.utils"

@ApiTags("faculty")
@Controller("faculties")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get()
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN, RoleEnum.DEPARTMENT_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all faculties' })
  @ApiQuery({ name: 'relations', required: false, description: 'Comma-separated list of relations to include' })
  @ApiOkResponse({ description: 'List of faculties' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have required role' })
  async findAll(@Query('relations') relations?: string) {
    const relationsList = relations ? relations.split(',') : [];
    return this.facultyService.findAll(relationsList);
  }

  @Get(":id")
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN, RoleEnum.DEPARTMENT_ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get faculty by ID" })
  @ApiParam({ name: "id", description: "Faculty ID" })
  @ApiQuery({ name: "relations", required: false, description: "Comma-separated list of relations to include" })
  @ApiOkResponse({ description: "Faculty details" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have required role" })
  @ApiNotFoundResponse({ description: "Faculty not found" })
  async findOne(@Param('id') id: string, @Query('relations') relations?: string) {
    const relationsList = relations ? relations.split(",") : []
    return this.facultyService.findById(id, relationsList)
  }

  @Post()
  @Roles(RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new faculty' })
  @ApiCreatedResponse({ description: 'Faculty created successfully' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have required role' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async create(@Body() createFacultyDto: CreateFacultyDto) {
    return this.facultyService.create(createFacultyDto);
  }

  @Put(":id")
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update faculty" })
  @ApiParam({ name: "id", description: "Faculty ID" })
  @ApiOkResponse({ description: "Faculty updated successfully" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have required role or permission" })
  @ApiNotFoundResponse({ description: "Faculty not found" })
  async update(@Param('id') id: string, @Body() updateFacultyDto: UpdateFacultyDto, @CurrentUser() user: User) {
    await this.ensureFacultyAdminOrSuperAdmin(id, user)
    return this.facultyService.update(id, updateFacultyDto)
  }

  @Delete(':id')
  @Roles(RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete faculty' })
  @ApiParam({ name: 'id', description: 'Faculty ID' })
  @ApiOkResponse({ description: 'Faculty deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have required role' })
  @ApiNotFoundResponse({ description: 'Faculty not found' })
  async remove(@Param('id') id: string) {
    await this.facultyService.remove(id);
    return { message: 'Faculty deleted successfully' };
  }

  @Put(":id/settings")
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update faculty settings" })
  @ApiParam({ name: "id", description: "Faculty ID" })
  @ApiOkResponse({ description: "Faculty settings updated successfully" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have required role or permission" })
  @ApiNotFoundResponse({ description: "Faculty not found" })
  async updateSettings(@Param('id') id: string, @Body() settingsDto: FacultySettingsDto, @CurrentUser() user: User) {
    await this.ensureFacultyAdminOrSuperAdmin(id, user)
    return this.facultyService.updateSettings(id, settingsDto)
  }

  @Get(':id/departments')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN, RoleEnum.DEPARTMENT_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get faculty departments' })
  @ApiParam({ name: 'id', description: 'Faculty ID' })
  @ApiOkResponse({ description: 'List of faculty departments' })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have required role' })
  @ApiNotFoundResponse({ description: 'Faculty not found' })
  async getDepartments(@Param('id') id: string) {
    return this.facultyService.getDepartments(id);
  }

  @Post(":id/departments")
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Add department to faculty" })
  @ApiParam({ name: "id", description: "Faculty ID" })
  @ApiCreatedResponse({ description: "Department added successfully" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have required role or permission" })
  @ApiNotFoundResponse({ description: "Faculty not found" })
  async addDepartment(
    @Param('id') id: string,
    @Body() createDepartmentDto: CreateDepartmentDto,
    @CurrentUser() user: User,
  ) {
    await this.ensureFacultyAdminOrSuperAdmin(id, user)
    return this.facultyService.createDepartment(id, createDepartmentDto)
  }

  @Get(":id/administrators")
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get faculty administrators" })
  @ApiParam({ name: "id", description: "Faculty ID" })
  @ApiOkResponse({ description: "List of faculty administrators" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have required role or permission" })
  @ApiNotFoundResponse({ description: "Faculty not found" })
  async getAdministrators(@Param('id') id: string, @CurrentUser() user: User) {
    await this.ensureFacultyAdminOrSuperAdmin(id, user)
    return this.facultyService.getAdministrators(id)
  }

  @Post(":id/administrators")
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Add administrator to faculty" })
  @ApiParam({ name: "id", description: "Faculty ID" })
  @ApiCreatedResponse({ description: "Administrator added successfully" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have required role or permission" })
  @ApiNotFoundResponse({ description: "Faculty not found" })
  async addAdministrator(
    @Param('id') id: string,
    @Body() adminDto: FacultyAdministratorDto,
    @CurrentUser() user: User,
  ) {
    await this.ensureFacultyAdminOrSuperAdmin(id, user)
    return this.facultyService.addAdministrator(id, adminDto)
  }

  @Delete(":id/administrators/:adminId")
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Remove administrator from faculty" })
  @ApiParam({ name: "id", description: "Faculty ID" })
  @ApiParam({ name: "adminId", description: "Administrator ID" })
  @ApiOkResponse({ description: "Administrator removed successfully" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have required role or permission" })
  @ApiNotFoundResponse({ description: "Faculty or administrator not found" })
  async removeAdministrator(@Param('id') id: string, @Param('adminId') adminId: string, @CurrentUser() user: User) {
    await this.ensureFacultyAdminOrSuperAdmin(id, user)
    await this.facultyService.removeAdministrator(id, adminId)
    return { message: "Administrator removed successfully" }
  }

  @Get(":id/dashboard")
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN, RoleEnum.DEPARTMENT_ADMIN)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get faculty dashboard data" })
  @ApiParam({ name: "id", description: "Faculty ID" })
  @ApiOkResponse({ description: "Faculty dashboard data" })
  @ApiUnauthorizedResponse({ description: "User not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have required role or permission" })
  @ApiNotFoundResponse({ description: "Faculty not found" })
  async getDashboardData(@Param('id') id: string, @CurrentUser() user: User) {
    if (hasRole(user, RoleEnum.DEPARTMENT_ADMIN)) {
      const belongsToFaculty = await this.checkUserBelongsToFaculty(id, String(user.id))
      if (!belongsToFaculty) {
        throw new ForbiddenException("You do not have permission to view this faculty dashboard")
      }
    }
    return this.facultyService.getDashboardData(id)
  }

  // --------- Private Helpers -----------

  private async ensureFacultyAdminOrSuperAdmin(facultyId: string, user: User) {
    if (hasRole(user, RoleEnum.SUPER_ADMIN)) {
      return
    }
    const isAdmin = await this.checkUserIsFacultyAdmin(facultyId, String(user.id))
    if (!isAdmin) {
      throw new ForbiddenException("You do not have permission to perform this action on this faculty")
    }
  }

  private async checkUserIsFacultyAdmin(facultyId: string, userId: string): Promise<boolean> {
    const admins = await this.facultyService.getAdministrators(facultyId)
    return admins.some((admin) => admin.userId === userId && admin.isActive)
  }

  private async checkUserBelongsToFaculty(facultyId: string, userId: string): Promise<boolean> {
    const admins = await this.facultyService.getAdministrators(facultyId)
    if (admins.some((admin) => admin.userId === userId)) {
      return true
    }
    const departments = await this.facultyService.getDepartments(facultyId)
    return departments.some((dept) => dept.departmentHeadId === userId)
  }
}
