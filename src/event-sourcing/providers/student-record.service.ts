import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StudentRecord } from '../../domain/student-record.aggregate';
import { StudentRecordRepository } from '../repositories/student-record.repository';

@Injectable()
export class StudentRecordService {
  private readonly logger = new Logger(StudentRecordService.name);

  constructor(
    private readonly studentRecordRepository: StudentRecordRepository,
  ) {}

  async getStudentRecord(studentId: string): Promise<StudentRecord> {
    try {
      return await this.studentRecordRepository.getById(studentId);
    } catch (error) {
      this.logger.error(`Failed to get student record for ${studentId}`, error);
      throw new NotFoundException(`Student record not found for ID ${studentId}`);
    }
  }

  async getStudentRecordAtVersion(studentId: string, version: number): Promise<StudentRecord> {
    try {
      return await this.studentRecordRepository.getByIdAtVersion(studentId, version);
    } catch (error) {
      this.logger.error(`Failed to get student record for ${studentId} at version ${version}`, error);
      throw new NotFoundException(`Student record not found for ID ${studentId} at version ${version}`);
    }
  }

  async getStudentRecordAtDate(studentId: string, date: Date): Promise<StudentRecord> {
    try {
      return await this.studentRecordRepository.getByIdAtDate(studentId, date);
    } catch (error) {
      this.logger.error(`Failed to get student record for ${studentId} at date ${date}`, error);
      throw new NotFoundException(`Student record not found for ID ${studentId} at date ${date}`);
    }
  }

  async recordGrade(params: {
    studentId: string;
    courseId: string;
    grade: string;
    points: number;
    semester: string;
    recordedBy: string;
  }): Promise<void> {
    const studentRecord = await this.getStudentRecord(params.studentId);
    
    studentRecord.recordGrade({
      courseId: params.courseId,
      grade: params.grade,
      points: params.points,
      recordedBy: params.recordedBy,
      semester: params.semester,
      metadata: { semester: params.semester },
    });
    
    await this.studentRecordRepository.save(studentRecord);
  }

  async modifyGrade(params: {
    studentId: string;
    courseId: string;
    newGrade: string;
    newPoints: number;
    modifiedBy: string;
    reason: string;
  }): Promise<void> {
    const studentRecord = await this.getStudentRecord(params.studentId);
    
    studentRecord.modifyGrade({
      courseId: params.courseId,
      newGrade: params.newGrade,
      newPoints: params.newPoints,
      modifiedBy: params.modifiedBy,
      reason: params.reason,
    });
    
    await this.studentRecordRepository.save(studentRecord);
  }

  async enrollInCourse(params: {
    studentId: string;
    courseId: string;
    semester: string;
    enrollmentDate: Date;
    enrolledBy: string;
  }): Promise<void> {
    const studentRecord = await this.getStudentRecord(params.studentId);
    
    studentRecord.enrollInCourse({
      courseId: params.courseId,
      semester: params.semester,
      enrollmentDate: params.enrollmentDate,
      enrolledBy: params.enrolledBy,
    });
    
    await this.studentRecordRepository.save(studentRecord);
  }

  async dropCourse(params: {
    studentId: string;
    courseId: string;
    semester: string;
    dropDate: Date;
    droppedBy: string;
    reason: string;
  }): Promise<void> {
    const studentRecord = await this.getStudentRecord(params.studentId);
    
    studentRecord.dropCourse({
      courseId: params.courseId,
      semester: params.semester,
      dropDate: params.dropDate,
      droppedBy: params.droppedBy,
      reason: params.reason,
    });
    
    await this.studentRecordRepository.save(studentRecord);
  }

  async updateDegreeProgress(params: {
    studentId: string;
    degreeId: string;
    creditsEarned: number;
    requirementsFulfilled: string[];
    remainingRequirements: string[];
    projectedCompletionDate: Date;
  }): Promise<void> {
    const studentRecord = await this.getStudentRecord(params.studentId);
    
    studentRecord.updateDegreeProgress({
      degreeId: params.degreeId,
      creditsEarned: params.creditsEarned,
      requirementsFulfilled: params.requirementsFulfilled,
      remainingRequirements: params.remainingRequirements,
      projectedCompletionDate: params.projectedCompletionDate,
    });
    
    await this.studentRecordRepository.save(studentRecord);
  }
}