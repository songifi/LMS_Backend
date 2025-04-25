import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEnrollment } from '../entities/course-enrollment.entity';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { FilterEnrollmentsDto } from '../dto/filter-enrollments.dto';
import { EnrollmentStatus } from '../enums/enrollmentStatus.enum';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(CourseEnrollment)
    private enrollmentRepository: Repository<CourseEnrollment>,
  ) {}

  async createEnrollment(createEnrollmentDto: CreateEnrollmentDto): Promise<CourseEnrollment> {
    const enrollmentDeadline = createEnrollmentDto.enrollmentDeadline || new Date();
    
    const enrollment = this.enrollmentRepository.create({
      ...createEnrollmentDto,
      enrollmentDeadline,
    });
    
    return this.enrollmentRepository.save(enrollment);
  }

  async getEnrollments(filters: FilterEnrollmentsDto): Promise<CourseEnrollment[]> {
    const queryBuilder = this.enrollmentRepository.createQueryBuilder('enrollment');
    
    if (filters.studentId) {
      queryBuilder.andWhere('enrollment.studentId = :studentId', { studentId: filters.studentId });
    }
    
    if (filters.courseId) {
      queryBuilder.andWhere('enrollment.courseId = :courseId', { courseId: filters.courseId });
    }
    
    if (filters.status) {
      queryBuilder.andWhere('enrollment.status = :status', { status: filters.status });
    }
    
    queryBuilder.leftJoinAndSelect('enrollment.student', 'student');
    
    return queryBuilder.getMany();
  }

  async updateEnrollmentStatus(id: string, status: EnrollmentStatus): Promise<CourseEnrollment> {
    const enrollment = await this.enrollmentRepository.findOneBy({ id });
    
    if (!enrollment) {
      throw new Error(`Enrollment with ID ${id} not found`);
    }
    
    enrollment.status = status;
    
    if (status === EnrollmentStatus.COMPLETED) {
      enrollment.completionDate = new Date();
    }
    
    return this.enrollmentRepository.save(enrollment);
  }

  async getEnrolledStudents(courseId: string): Promise<CourseEnrollment[]> {
    return this.enrollmentRepository.find({
      where: {
        courseId,
        status: EnrollmentStatus.ENROLLED,
        isActive: true,
      },
      relations: ['student'],
    });
  }

  async promoteFromWaitlist(courseId: string): Promise<CourseEnrollment | null> {
    const waitlistedStudent = await this.enrollmentRepository.findOne({
      where: {
        courseId,
        status: EnrollmentStatus.WAITLISTED,
        isActive: true,
      },
      order: {
        enrollmentDate: 'ASC',
      },
    });
    
    if (!waitlistedStudent) {
      return null;
    }
    
    return this.updateEnrollmentStatus(waitlistedStudent.id, EnrollmentStatus.ENROLLED);
  }

  // ✅ Added: checkCourseCapacity with default capacity
  async checkCourseCapacity(courseId: string, capacity = 30): Promise<boolean> {
    const enrolledCount = await this.enrollmentRepository.count({
      where: {
        courseId,
        status: EnrollmentStatus.ENROLLED,
        isActive: true,
      },
    });

    return enrolledCount < capacity;
  }
}
