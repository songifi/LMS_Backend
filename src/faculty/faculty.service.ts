import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import {
  CreateFacultyDto,
  UpdateFacultyDto,
  FacultySettingsDto,
  CreateDepartmentDto,
  FacultyAdministratorDto,
} from './dto/create-faculty.dto';
import { Faculty } from './entities/faculty.entity';
import { Department } from './entities/department.entity';
import { FacultySettings } from './entities/faculty-settings.entity';
import { AdminRole, FacultyAdministrator } from './entities/faculty-administrator.entity';
import { UsersService } from 'src/user/providers/user.service';
import { FacultyDashboardService } from './faculty-dashboard.service';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Faculty)
    private facultyRepository: Repository<Faculty>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(FacultySettings)
    private facultySettingsRepository: Repository<FacultySettings>,
    @InjectRepository(FacultyAdministrator)
    private facultyAdminRepository: Repository<FacultyAdministrator>,
    private userService: UsersService,
    private facultyDashboardService: FacultyDashboardService,
  ) {}

  async findAll(relations: string[] = []): Promise<Faculty[]> {
    return this.facultyRepository.find({ relations });
  }

  async findById(id: string, relations: string[] = []): Promise<Faculty> {
    const faculty = await this.facultyRepository.findOne({
      where: { id: Number(id) },
      relations,
    });

    if (!faculty) {
      throw new NotFoundException(`Faculty with ID "${id}" not found`);
    }

    return faculty;
  }

  async create(createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    const { facultyHeadId, ...facultyData } = createFacultyDto;

    const existingFaculty = await this.facultyRepository.findOne({
      where: [{ name: facultyData.name }, { code: facultyData.code }],
    });

    if (existingFaculty) {
      throw new BadRequestException(
        'Faculty with this name or code already exists',
      );
    }

    const faculty = this.facultyRepository.create(facultyData);

    if (facultyHeadId) {
      const user = await this.userService.findById(facultyHeadId.toString());
      faculty.facultyHead = user;
      faculty.facultyHeadId = facultyHeadId.toString();
    }

    const savedFaculty = await this.facultyRepository.save(faculty);

    const settings = this.facultySettingsRepository.create({
      facultyId: savedFaculty.id,
      isActive: true,
    });

    await this.facultySettingsRepository.save(settings);

    return this.findById(savedFaculty.id.toString(), ['facultyHead', 'settings']);
  }

  async update(id: string, updateFacultyDto: UpdateFacultyDto): Promise<Faculty> {
    const faculty = await this.findById(id);
    const { facultyHeadId, ...updateData } = updateFacultyDto;

    if (updateData.name || updateData.code) {
      const existingFaculty = await this.facultyRepository.findOne({
        where: [
          { name: updateData.name, id: Not(Number(id)) },
          { code: updateData.code, id: Not(Number(id)) },
        ],
      });

      if (existingFaculty) {
        throw new BadRequestException(
          'Faculty with this name or code already exists',
        );
      }
    }

    if (facultyHeadId) {
      const user = await this.userService.findById(facultyHeadId);
      faculty.facultyHead = user;
      faculty.facultyHeadId = facultyHeadId;
    }

    Object.assign(faculty, updateData);

    return this.facultyRepository.save(faculty);
  }

  async remove(id: string): Promise<void> {
    const faculty = await this.findById(id);

    const departmentsCount = await this.departmentRepository.count({
      where: { facultyId: id.toString() },
    });

    if (departmentsCount > 0) {
      throw new BadRequestException(
        `Cannot delete faculty with ID "${id}" as it has ${departmentsCount} associated departments`,
      );
    }

    await this.facultyRepository.remove(faculty);
  }

  async updateSettings(
    id: string,
    settingsDto: FacultySettingsDto,
  ): Promise<FacultySettings> {
    await this.findById(id);
    let settings = await this.facultySettingsRepository.findOne({
      where: { facultyId: Number(id) },
    });

    if (!settings) {
      settings = this.facultySettingsRepository.create({
        facultyId: Number(id),
        ...settingsDto,
      });
    } else {
      Object.assign(settings, settingsDto);
    }

    return this.facultySettingsRepository.save(settings);
  }

  async getDepartments(facultyId: string): Promise<Department[]> {
    await this.findById(facultyId);
    return this.departmentRepository.find({
      where: { facultyId },
      relations: ['departmentHead'],
    });
  }

  async createDepartment(
    facultyId: string,
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<Department> {
    await this.findById(facultyId);

    const existingDept = await this.departmentRepository.findOne({
      where: [
        { name: createDepartmentDto.name },
        { code: createDepartmentDto.code },
      ],
    });

    if (existingDept) {
      throw new BadRequestException(
        'Department with this name or code already exists',
      );
    }

    const department = this.departmentRepository.create({
      ...createDepartmentDto,
      facultyId,
    });

    if (createDepartmentDto.departmentHeadId) {
      const user = await this.userService.findById(
        createDepartmentDto.departmentHeadId,
      );
      department.departmentHead = user;
      department.departmentHeadId = createDepartmentDto.departmentHeadId;
    }

    return this.departmentRepository.save(department);
  }

  async getAdministrators(
    facultyId: string,
  ): Promise<FacultyAdministrator[]> {
    await this.findById(facultyId);
    return this.facultyAdminRepository.find({
      where: { facultyId },
      relations: ['user'],
    });
  }

  async addAdministrator(
    facultyId: string,
    adminDto: FacultyAdministratorDto,
  ): Promise<FacultyAdministrator> {
    await this.findById(facultyId);
    const user = await this.userService.findById(adminDto.userId);

    const existingAdmin = await this.facultyAdminRepository.findOne({
      where: {
        facultyId,
        userId: adminDto.userId,
      },
    });

    if (existingAdmin) {
      throw new BadRequestException(
        'This user is already an administrator for this faculty',
      );
    }

    const admin = this.facultyAdminRepository.create({
      facultyId,
      userId: adminDto.userId,
      role: adminDto.role as AdminRole, // Ensure role matches the expected type
      permissions: adminDto.permissions || [],
      isActive: true,
    });

    return this.facultyAdminRepository.save(admin);
  }

  async removeAdministrator(facultyId: string, adminId: string): Promise<void> {
    const admin = await this.facultyAdminRepository.findOne({
      where: {
        id: Number(adminId),
        facultyId,
      },
    });

    if (!admin) {
      throw new NotFoundException(
        `Administrator with ID "${adminId}" not found for faculty "${facultyId}"`,
      );
    }

    await this.facultyAdminRepository.remove(admin);
  }

  async getDashboardData(facultyId: string): Promise<any> {
    const faculty = await this.findById(facultyId, ['facultyHead']);
    const departments = await this.getDepartments(facultyId);
    const admins = await this.getAdministrators(facultyId);

    const departmentsCount = departments.length;
    const activeAdminsCount = admins.filter((admin) => admin.isActive).length;

    return {
      faculty: {
        id: faculty.id,
        name: faculty.name,
        code: faculty.code,
        logoUrl: faculty.logoUrl,
        facultyHead: faculty.facultyHead
          ? {
              id: faculty.facultyHead.id,
              name: `${faculty.facultyHead.firstName} ${faculty.facultyHead.lastName}`,
              email: faculty.facultyHead.email,
            }
          : null,
      },
      summary: {
        departmentsCount,
        administratorsCount: admins.length,
        activeAdministratorsCount: activeAdminsCount,
      },
      departments: departments.map((dept) => ({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        departmentHead: dept.departmentHead
          ? {
              id: dept.departmentHead.id,
              name: `${dept.departmentHead.firstName} ${dept.departmentHead.lastName}`,
            }
          : null,
      })),
    };
  }
}
