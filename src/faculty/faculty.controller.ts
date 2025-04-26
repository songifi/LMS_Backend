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
import { CreateDepartmentDto, CreateFacultyDto, FacultyAdministratorDto, FacultySettingsDto, UpdateFacultyDto } from './dto/create-faculty.dto';

@Controller('faculties')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get()
  @Roles('admin', 'faculty_admin', 'staff')
  async findAll(@Query('relations') relations?: string) {
    const relationsList = relations ? relations.split(',') : [];
    return this.facultyService.findAll(relationsList);
  }

  @Get(':id')
  @Roles('admin', 'faculty_admin', 'staff')
  async findOne(@Param('id') id: string, @Query('relations') relations?: string) {
    const relationsList = relations ? relations.split(',') : [];
    return this.facultyService.findById(id, relationsList);
  }

  @Post()
  @Roles('admin')
  async create(@Body() createFacultyDto: CreateFacultyDto) {
    return this.facultyService.create(createFacultyDto);
  }

  @Put(':id')
  @Roles('admin', 'faculty_admin')
  async update(
    @Param('id') id: string,
    @Body() updateFacultyDto: UpdateFacultyDto,
    @CurrentUser() user: User
  ) {
    // Check if user has permission to update this faculty
    if (!user.roles.some(role => role.name === 'admin')) {
      const isAdmin = await this.checkUserIsFacultyAdmin(id, String(user.id));
      if (!isAdmin) {
        throw new ForbiddenException('You do not have permission to update this faculty');
      }
    }

    return this.facultyService.update(id, updateFacultyDto);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string) {
    await this.facultyService.remove(id);
    return { message: 'Faculty deleted successfully' };
  }

  @Put(':id/settings')
  @Roles('admin', 'faculty_admin')
  async updateSettings(
    @Param('id') id: string,
    @Body() settingsDto: FacultySettingsDto,
    @CurrentUser() user: User
  ) {
    // Check if user has permission
    if (!user.roles.some(role => role.name === 'admin')) {
      const isAdmin = await this.checkUserIsFacultyAdmin(id, String(user.id));
      if (!isAdmin) {
        throw new ForbiddenException('You do not have permission to update settings for this faculty');
      }
    }

    return this.facultyService.updateSettings(id, settingsDto);
  }

  @Get(':id/departments')
  @Roles('admin', 'faculty_admin', 'staff')
  async getDepartments(@Param('id') id: string) {
    return this.facultyService.getDepartments(id);
  }

  @Post(':id/departments')
  @Roles('admin', 'faculty_admin')
  async addDepartment(
    @Param('id') id: string,
    @Body() createDepartmentDto: CreateDepartmentDto,
    @CurrentUser() user: User
  ) {
    // Check if user has permission
    if (!user.roles.some(role => role.name === 'admin')) {
      const isAdmin = await this.checkUserIsFacultyAdmin(id, String(user.id));
      if (!isAdmin) {
        throw new ForbiddenException('You do not have permission to add departments to this faculty');
      }
    }

    return this.facultyService.createDepartment(id, createDepartmentDto);
  }

  @Get(':id/administrators')
  @Roles('admin', 'faculty_admin')
  async getAdministrators(
    @Param('id') id: string,
    @CurrentUser() user: User
  ) {
    // Check if user has permission
    if (!user.roles.some(role => role.name === 'admin')) {
      const isAdmin = await this.checkUserIsFacultyAdmin(id, String(user.id));
      if (!isAdmin) {
        throw new ForbiddenException('You do not have permission to view administrators for this faculty');
      }
    }

    return this.facultyService.getAdministrators(id);
  }

  @Post(':id/administrators')
  @Roles('admin', 'faculty_admin')
  async addAdministrator(
    @Param('id') id: string,
    @Body() adminDto: FacultyAdministratorDto,
    @CurrentUser() user: User
  ) {
    // Check if user has permission
    if (!user.roles.some(role => role.name === 'admin')) {
      const isAdmin = await this.checkUserIsFacultyAdmin(id, String(user.id));
      if (!isAdmin) {
        throw new ForbiddenException('You do not have permission to add administrators to this faculty');
      }
    }

    return this.facultyService.addAdministrator(id, adminDto);
  }

  @Delete(':id/administrators/:adminId')
  @Roles('admin', 'faculty_admin')
  async removeAdministrator(
    @Param('id') id: string,
    @Param('adminId') adminId: string,
    @CurrentUser() user: User
  ) {
    // Check if user has permission
    if (!user.roles.some(role => role.name === 'admin')) {
      const isAdmin = await this.checkUserIsFacultyAdmin(id, String(user.id));
      if (!isAdmin) {
        throw new ForbiddenException('You do not have permission to remove administrators from this faculty');
      }
    }

    await this.facultyService.removeAdministrator(id, adminId);
    return { message: 'Administrator removed successfully' };
  }

  @Get(':id/dashboard')
  @Roles('admin', 'faculty_admin', 'staff')
  async getDashboardData(
    @Param('id') id: string,
    @CurrentUser() user: User
  ) {
    // Faculty staff members can view their own faculty dashboard
    if (user.roles.some(role => role.name === 'staff')) {
      // Check if user belongs to this faculty
      // This would require a method to check if user is assigned to this faculty
      const belongsToFaculty = await this.checkUserBelongsToFaculty(id, String(user.id));
      if (!belongsToFaculty) {
        throw new ForbiddenException('You do not have permission to view this faculty dashboard');
      }
    }

    return this.facultyService.getDashboardData(id);
  }

  // Helper methods for permission checks
  private async checkUserIsFacultyAdmin(facultyId: string, userId: string): Promise<boolean> {
    const admins = await this.facultyService.getAdministrators(facultyId);
    return admins.some(admin => admin.userId === userId && admin.isActive);
  }

  private async checkUserBelongsToFaculty(facultyId: string, userId: string): Promise<boolean> {
    // This would require a user-faculty relationship check
    // For simplicity, we're assuming there's a method to check this
    // In a real application, you would implement this based on your user-faculty relationship
    const admins = await this.facultyService.getAdministrators(facultyId);
    if (admins.some(admin => admin.userId === userId)) {
      return true;
    }
    
    // You could also check if the user is a department head or member of any department in this faculty
    const departments = await this.facultyService.getDepartments(facultyId);
    return departments.some(dept => dept.departmentHeadId === userId);
  }
}