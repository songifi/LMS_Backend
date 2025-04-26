import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faculty } from './entities/faculty.entity';
import { Department } from './entities/department.entity';
import { FacultyAdministrator } from './entities/faculty-administrator.entity';
import { User } from 'src/user/entities/user.entity';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class FacultyDashboardService {
  constructor(
    @InjectRepository(Faculty)
    private facultyRepository: Repository<Faculty>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(FacultyAdministrator)
    private facultyAdminRepository: Repository<FacultyAdministrator>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private cacheService: CacheService
    
  ) {}

  private getCacheKey(facultyId: string): string {
    return `faculty_dashboard_${facultyId}`;
  }

  async getDashboardData(facultyId: string): Promise<any> {
    // Try to get from cache first
    const cacheKey = this.getCacheKey(facultyId);
    const cachedData = await this.cacheService.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    // If not in cache, generate the dashboard data
    const dashboardData = await this.generateDashboardData(facultyId);
    
    // Store in cache with 15 min TTL
    await this.cacheService.set(cacheKey, dashboardData, 15 * 60);
    
    return dashboardData;
  }

  async invalidateDashboardCache(facultyId: string): Promise<void> {
    const cacheKey = this.getCacheKey(facultyId);
    await this.cacheService.del(cacheKey);
  }

  private async generateDashboardData(facultyId: string): Promise<any> {
    // Optimized query to get faculty with faculty head
    const faculty = await this.facultyRepository
      .createQueryBuilder('faculty')
      .leftJoinAndSelect('faculty.facultyHead', 'facultyHead')
      .where('faculty.id = :id', { id: facultyId })
      .getOne();
    
    if (!faculty) {
      throw new Error(`Faculty with ID "${facultyId}" not found`);
    }
    
    // Get departments with department heads in a single query
    const departments = await this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.departmentHead', 'departmentHead')
      .where('department.facultyId = :facultyId', { facultyId })
      .getMany();
    
    // Get administrators with user info in a single query
    const administrators = await this.facultyAdminRepository
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.user', 'user')
      .where('admin.facultyId = :facultyId', { facultyId })
      .getMany();
    
    // Get counts using optimized count queries
    const departmentsCount = departments.length;
    const adminCount = administrators.length;
    const activeAdminCount = administrators.filter(admin => admin.isActive).length;
    
    // Get faculty stats using separate optimized queries
    // This could include additional metrics like program counts, student counts, etc.
    
    // Format the response
    return {
      faculty: {
        id: faculty.id,
        name: faculty.name,
        code: faculty.code,
        description: faculty.description,
        logoUrl: faculty.logoUrl,
        facultyHead: faculty.facultyHead ? {
          id: faculty.facultyHead.id,
          name: `${faculty.facultyHead.firstName} ${faculty.facultyHead.lastName}`,
          email: faculty.facultyHead.email
        } : null
      },
      statistics: {
        departmentsCount,
        administratorsCount: adminCount,
        activeAdministratorsCount: activeAdminCount
      },
      departments: departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        departmentHead: dept.departmentHead ? {
          id: dept.departmentHead.id,
          name: `${dept.departmentHead.firstName} ${dept.departmentHead.lastName}`
        } : null
      })),
      administrators: administrators.map(admin => ({
        id: admin.id,
        role: admin.role,
        isActive: admin.isActive,
        user: {
          id: admin.user.id,
          name: `${admin.user.firstName} ${admin.user.lastName}`,
          email: admin.user.email
        }
      }))
    };
  }
}