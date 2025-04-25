import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseAttendance } from '../entities/course-attendance.entity';
import { CourseSession } from '../entities/course-session.entity';
import { CourseEnrollment } from '../entities/course-enrollment.entity';
import { FilterAttendanceDto } from '../dto/filter-attendance.dto';
import { EnrollmentStatus } from '../enums/enrollmentStatus.enum';
import { AttendanceStatus } from '../enums/attendanceStatus.enum';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(CourseAttendance)
    private attendanceRepository: Repository<CourseAttendance>,
    
    @InjectRepository(CourseSession)
    private sessionRepository: Repository<CourseSession>,
    
    @InjectRepository(CourseEnrollment)
    private enrollmentRepository: Repository<CourseEnrollment>,
  ) {}

  async getSessionDetails(sessionId: string): Promise<CourseSession> {
    const session = await this.sessionRepository.findOneBy({ id: sessionId });
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }
    return session;
  }

  async recordAttendance(attendanceData: any): Promise<CourseAttendance> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        studentId: attendanceData.studentId,
        courseId: attendanceData.courseId,
        status: EnrollmentStatus.ENROLLED,
        isActive: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Student is not enrolled in this course');
    }

    const existingRecord = await this.attendanceRepository.findOne({
      where: {
        sessionId: attendanceData.sessionId,
        studentId: attendanceData.studentId,
      },
    });

    if (existingRecord) {
      existingRecord.status = attendanceData.status;
      existingRecord.justification = attendanceData.justification;
      existingRecord.recordedBy = attendanceData.recordedBy;
      existingRecord.recordedAt = attendanceData.recordedAt;
      return await this.attendanceRepository.save(existingRecord);
    }

    const newAttendance: CourseAttendance = this.attendanceRepository.create({
      sessionId: attendanceData.sessionId,
      studentId: attendanceData.studentId,
      courseId: attendanceData.courseId,
      status: attendanceData.status,
      justification: attendanceData.justification,
      recordedBy: attendanceData.recordedBy,
      recordedAt: attendanceData.recordedAt,
    });

    return await this.attendanceRepository.save(newAttendance);
  }

  async getAttendanceRecords(filters: FilterAttendanceDto): Promise<CourseAttendance[]> {
    const queryBuilder = this.attendanceRepository.createQueryBuilder('attendance');

    if (filters.sessionId) {
      queryBuilder.andWhere('attendance.sessionId = :sessionId', { sessionId: filters.sessionId });
    }

    if (filters.studentId) {
      queryBuilder.andWhere('attendance.studentId = :studentId', { studentId: filters.studentId });
    }

    if (filters.status) {
      queryBuilder.andWhere('attendance.status = :status', { status: filters.status });
    }

    queryBuilder.leftJoinAndSelect('attendance.session', 'session');
    queryBuilder.leftJoinAndSelect('attendance.recorder', 'recorder');

    return await queryBuilder.getMany();
  }

  async getStudentAttendanceSummary(studentId: string, courseId: string): Promise<any> {
    const sessions = await this.sessionRepository.find({ where: { courseId } });

    const attendanceRecords = await this.attendanceRepository.find({
      where: { studentId, courseId },
    });

    const totalSessions = sessions.length;
    const attended = attendanceRecords.filter(a => a.status === AttendanceStatus.PRESENT).length;
    const excused = attendanceRecords.filter(a => a.status === AttendanceStatus.EXCUSED).length;
    const absent = attendanceRecords.filter(a => a.status === AttendanceStatus.ABSENT).length;
    const late = attendanceRecords.filter(a => a.status === AttendanceStatus.LATE).length;

    return {
      totalSessions,
      attended,
      excused,
      absent,
      late,
      attendanceRate: totalSessions > 0 ? (attended + excused) / totalSessions : 0,
    };
  }
}
