import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  ForbiddenException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FacultyService } from './faculty.service';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/entities/user.entity';
import {
  CreateDepartmentDto,
  CreateFacultyDto,
  FacultyAdministratorDto,
  FacultySettingsDto,
  UpdateFacultyDto
} from './dto/create-faculty.dto';
import { RoleEnum } from 'src/user/role.enum';

// OPTION 1: Define a type that represents roles in your system
type Role = string;

// OPTION 2: Create a helper function to safely convert RoleEnum to Role
function asRole(role: RoleEnum): Role {
  return role as unknown as Role;
}

// OPTION 3: Create helper function for role checking that works with your User entity
function hasRole(user: User, role: RoleEnum): boolean {
  if (!user || !user.roles) return false;
  
  // Handle different possible user.roles formats
  if (Array.isArray(user.roles)) {
    const roleStr = String(role);
    return user.roles.some((r: any) => 
      r === role || 
      r === roleStr || 
      (typeof r === 'object' && r?.name === roleStr)
    );
  }
  return false;
}

@Controller('faculties')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get()
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN, RoleEnum.DEPARTMENT_ADMIN)
  async findAll(@Query('relations') relations?: string) {
    const relationsList = relations ? relations.split(',') : [];
    return this.facultyService.findAll(relationsList);
  }

  @Get(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN, RoleEnum.DEPARTMENT_ADMIN)
  async findOne(@Param('id') id: string, @Query('relations') relations?: string) {
    const relationsList = relations ? relations.split(',') : [];
    return this.facultyService.findById(id, relationsList);
  }

  @Post()
  @Roles(RoleEnum.SUPER_ADMIN)
  async create(@Body() createFacultyDto: CreateFacultyDto) {
    return this.facultyService.create(createFacultyDto);
  }

  @Put(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN)
  async update(@Param('id') id: string, @Body() updateFacultyDto: UpdateFacultyDto, @CurrentUser() user: User) {
    await this.ensureFacultyAdminOrSuperAdmin(id, user);
    return this.facultyService.update(id, updateFacultyDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    await this.facultyService.remove(id);
    return { message: 'Faculty deleted successfully' };
  }

  @Put(':id/settings')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN)
  async updateSettings(@Param('id') id: string, @Body() settingsDto: FacultySettingsDto, @CurrentUser() user: User) {
    await this.ensureFacultyAdminOrSuperAdmin(id, user);
    return this.facultyService.updateSettings(id, settingsDto);
  }

  @Get(':id/departments')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN, RoleEnum.DEPARTMENT_ADMIN)
  async getDepartments(@Param('id') id: string) {
    return this.facultyService.getDepartments(id);
  }

  @Post(':id/departments')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN)
  async addDepartment(@Param('id') id: string, @Body() createDepartmentDto: CreateDepartmentDto, @CurrentUser() user: User) {
    await this.ensureFacultyAdminOrSuperAdmin(id, user);
    return this.facultyService.createDepartment(id, createDepartmentDto);
  }

  @Get(':id/administrators')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN)
  async getAdministrators(@Param('id') id: string, @CurrentUser() user: User) {
    await this.ensureFacultyAdminOrSuperAdmin(id, user);
    return this.facultyService.getAdministrators(id);
  }

  @Post(':id/administrators')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN)
  async addAdministrator(@Param('id') id: string, @Body() adminDto: FacultyAdministratorDto, @CurrentUser() user: User) {
    await this.ensureFacultyAdminOrSuperAdmin(id, user);
    return this.facultyService.addAdministrator(id, adminDto);
  }

  @Delete(':id/administrators/:adminId')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN)
  async removeAdministrator(@Param('id') id: string, @Param('adminId') adminId: string, @CurrentUser() user: User) {
    await this.ensureFacultyAdminOrSuperAdmin(id, user);
    await this.facultyService.removeAdministrator(id, adminId);
    return { message: 'Administrator removed successfully' };
  }

  @Get(':id/dashboard')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.FACULTY_ADMIN, RoleEnum.DEPARTMENT_ADMIN)
  async getDashboardData(@Param('id') id: string, @CurrentUser() user: User) {
    if (hasRole(user, RoleEnum.DEPARTMENT_ADMIN)) {
      const belongsToFaculty = await this.checkUserBelongsToFaculty(id, String(user.id));
      if (!belongsToFaculty) {
        throw new ForbiddenException('You do not have permission to view this faculty dashboard');
      }
    }
    return this.facultyService.getDashboardData(id);
  }

  // --------- Private Helpers -----------

  private async ensureFacultyAdminOrSuperAdmin(facultyId: string, user: User) {
    if (hasRole(user, RoleEnum.SUPER_ADMIN)) {
      return;
    }
    const isAdmin = await this.checkUserIsFacultyAdmin(facultyId, String(user.id));
    if (!isAdmin) {
      throw new ForbiddenException('You do not have permission to perform this action on this faculty');
    }
  }

  private async checkUserIsFacultyAdmin(facultyId: string, userId: string): Promise<boolean> {
    const admins = await this.facultyService.getAdministrators(facultyId);
    return admins.some(admin => admin.userId === userId && admin.isActive);
  }

  private async checkUserBelongsToFaculty(facultyId: string, userId: string): Promise<boolean> {
    const admins = await this.facultyService.getAdministrators(facultyId);
    if (admins.some(admin => admin.userId === userId)) {
      return true;
    }
    const departments = await this.facultyService.getDepartments(facultyId);
    return departments.some(dept => dept.departmentHeadId === userId);
  }
}