import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { CourseProgress } from '../entities/course-progress.entity';
import { CourseSession } from '../entities/course-session.entity';
import { CourseAttendance } from '../entities/course-attendance.entity';
import { CourseEnrollment } from '../entities/course-enrollment.entity';
import { FilterProgressDto } from '../dto/filter-progress.dto';
import { NotificationService } from './notification.service';
import { NotificationType } from '../enums/notificationType.enum';
import { NotificationPriority } from '../enums/notificationPriority.enum';
import { AttendanceStatus } from '../enums/attendanceStatus.enum';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(CourseProgress)
    private progressRepository: Repository<CourseProgress>,
    @InjectRepository(CourseSession)
    private sessionRepository: Repository<CourseSession>,
    @InjectRepository(CourseAttendance)
    private attendanceRepository: Repository<CourseAttendance>,
    private notificationService: NotificationService,
  ) {}

  async initializeProgress(enrollment: CourseEnrollment, totalActivities: number = 0, completionDeadline?: Date): Promise<CourseProgress> {
    const progress = this.progressRepository.create({
      enrollmentId: enrollment.id,
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      percentComplete: 0,
      lastActivityDate: new Date(),
      activitiesCompleted: 0,
      totalActivities: totalActivities,
      deadline: completionDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 day deadline if not provided
      isCompleted: false,
    });

    return this.progressRepository.save(progress);
  }

  async getProgress(filters: FilterProgressDto): Promise<CourseProgress[]> {
    const queryBuilder = this.progressRepository.createQueryBuilder('progress');

    if (filters.studentId) {
      queryBuilder.andWhere('progress.studentId = :studentId', { studentId: filters.studentId });
    }

    if (filters.courseId) {
      queryBuilder.andWhere('progress.courseId = :courseId', { courseId: filters.courseId });
    }

    if (filters.isCompleted !== undefined) {
      queryBuilder.andWhere('progress.isCompleted = :isCompleted', { isCompleted: filters.isCompleted });
    }

    queryBuilder.leftJoinAndSelect('progress.student', 'student');

    return queryBuilder.getMany();
  }

  async updateProgress(id: string, updateData: any): Promise<CourseProgress> {
    const progress = await this.progressRepository.findOneBy({ id });
    
    if (!progress) {
      throw new Error(`Progress record with id ${id} not found`);
    }

    // Calculate percent complete
    if (updateData.activitiesCompleted !== undefined) {
      updateData.percentComplete = (updateData.activitiesCompleted / progress.totalActivities) * 100;
    }

    // Update the progress record
    await this.progressRepository.update(id, {
      ...updateData,
      lastActivityDate: new Date(),
    });

    const updatedProgress = await this.progressRepository.findOneBy({ id });
    if (!updatedProgress) {
      throw new Error(`Progress record with id ${id} not found after update`);
    }
    
    return updatedProgress;
  }

  async updateProgressFromAttendance(
    studentId: string,
    sessionId: string,
    attendanceStatus: AttendanceStatus,
  ): Promise<CourseProgress | null> {
    const session = await this.sessionRepository.findOneBy({ id: sessionId });
    
    if (!session) {
      throw new Error(`Session with id ${sessionId} not found`);
    }

    const progress = await this.progressRepository.findOne({
      where: {
        studentId,
        courseId: session.courseId,
      },
    });

    if (!progress) return null;

    // Only count if present or excused
    if ([AttendanceStatus.PRESENT, AttendanceStatus.EXCUSED].includes(attendanceStatus)) {
      // Get all sessions for this course
      const courseSessions = await this.sessionRepository.count({
        where: { courseId: session.courseId },
      });

      // Get all attended sessions
      const attendedSessions = await this.attendanceRepository.count({
        where: {
          studentId,
          courseId: session.courseId,
          status: In([AttendanceStatus.PRESENT, AttendanceStatus.EXCUSED]),
        },
      });

      // Update progress
      return this.updateProgress(progress.id, {
        activitiesCompleted: attendedSessions,
        totalActivities: courseSessions,
        isCompleted: attendedSessions === courseSessions,
      });
    }

    return progress;
  }

  async checkDeadlines(): Promise<CourseProgress[]> {
    // Check for approaching deadlines and send notifications
    const approachingDeadline = new Date();
    approachingDeadline.setDate(approachingDeadline.getDate() + 7); // 7 days from now

    const progressRecords = await this.progressRepository.find({
      where: {
        deadline: LessThan(approachingDeadline),
        isCompleted: false,
      },
      relations: ['student'],
    });

    for (const progress of progressRecords) {
      await this.notificationService.sendNotification({
        recipientId: progress.studentId,
        courseId: progress.courseId,
        type: NotificationType.DEADLINE,
        message: `Course completion deadline is approaching. You have completed ${progress.percentComplete.toFixed(1)}% of the course.`,
        priority: NotificationPriority.HIGH,
      });
    }

    return progressRecords;
  }
}