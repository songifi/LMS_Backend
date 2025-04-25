import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEnrollment } from '../entities/course-enrollment.entity';
import { CourseAttendance } from '../entities/course-attendance.entity';
import { CourseSession } from '../entities/course-session.entity';
import { CourseProgress } from '../entities/course-progress.entity';
import { EnrollmentStatus } from '../enums/enrollmentStatus.enum';
import { AttendanceStatus } from '../enums/attendanceStatus.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(CourseEnrollment)
    private enrollmentRepository: Repository<CourseEnrollment>,
    @InjectRepository(CourseAttendance)
    private attendanceRepository: Repository<CourseAttendance>,
    @InjectRepository(CourseSession)
    private sessionRepository: Repository<CourseSession>,
    @InjectRepository(CourseProgress)
    private progressRepository: Repository<CourseProgress>,
  ) {}

  async getCourseAnalytics(courseId: string, period: string = 'ALL'): Promise<any> {
    // Get enrollment statistics
    const enrollments = await this.enrollmentRepository.find({
      where: { courseId },
    });

    // Get sessions
    const sessions = await this.sessionRepository.find({
      where: { courseId },
      order: { startTime: 'ASC' },
    });

    // Get attendance records
    const attendance = await this.attendanceRepository.find({
      where: { courseId },
      relations: ['student', 'session'],
    });

    // Get progress records
    const progress = await this.progressRepository.find({
      where: { courseId },
      relations: ['student'],
    });

    // Calculate enrollment statistics
    const enrollmentStats = {
      total: enrollments.length,
      active: enrollments.filter(e => e.isActive).length,
      completed: enrollments.filter(e => e.status === EnrollmentStatus.COMPLETED).length,
      dropped: enrollments.filter(e => e.status === EnrollmentStatus.DROPPED).length,
      waitlisted: enrollments.filter(e => e.status === EnrollmentStatus.WAITLISTED).length,
      completionRate: enrollments.length > 0 ? 
        enrollments.filter(e => e.status === EnrollmentStatus.COMPLETED).length / enrollments.length : 0,
    };

    // Calculate attendance statistics
    const activeEnrollments = enrollments.filter(e => e.isActive && e.status === EnrollmentStatus.ENROLLED).length;
    
    const attendanceStats = {
      totalSessions: sessions.length,
      avgAttendance: sessions.length > 0 && activeEnrollments > 0 ?
        attendance.filter(a => a.status === AttendanceStatus.PRESENT).length / 
        (sessions.length * activeEnrollments) : 0,
      sessionBreakdown: sessions.map(session => {
        const sessionAttendance = attendance.filter(a => a.sessionId === session.id);
        return {
          sessionId: session.id,
          sessionTitle: session.title,
          date: session.startTime,
          totalAttendees: sessionAttendance.filter(a => 
            [AttendanceStatus.PRESENT, AttendanceStatus.LATE].includes(a.status)).length,
          absentees: sessionAttendance.filter(a => a.status === AttendanceStatus.ABSENT).length,
          attendanceRate: activeEnrollments > 0 ?
            sessionAttendance.filter(a => 
              [AttendanceStatus.PRESENT, AttendanceStatus.LATE].includes(a.status)).length /
            activeEnrollments : 0,
        };
      }),
    };

    // Calculate progress statistics
    const progressStats = {
      avgCompletion: progress.length > 0 ?
        progress.reduce((sum, p) => sum + Number(p.percentComplete), 0) / progress.length : 0,
      completedCount: progress.filter(p => p.isCompleted).length,
      inProgressCount: progress.filter(p => !p.isCompleted).length,
      atRiskCount: progress.filter(p => {
        // Students with less than 50% completion and deadline within 14 days
        const deadline = new Date(p.deadline);
        const twoWeeksFromNow = new Date();
        twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
        
        return !p.isCompleted && p.percentComplete < 50 && deadline <= twoWeeksFromNow;
      }).length,
    };

    return {
      courseId,
      period,
      enrollment: enrollmentStats,
      attendance: attendanceStats,
      progress: progressStats,
      generatedAt: new Date(),
    };
  }
}