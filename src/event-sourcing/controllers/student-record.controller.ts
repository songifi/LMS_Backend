import { 
    Body, 
    Controller, 
    Get, 
    Param, 
    Post, 
    Query 
  } from '@nestjs/common';
  import { StudentRecordService } from '../services/student-record.service';
  import { 
    CourseEnrollment, 
    CourseGrade, 
    DegreeProgress, 
    StudentRecord 
  } from '../../domain/student-record.aggregate';
  
  @Controller('academic/students')
  export class StudentRecordController {
    constructor(
      private readonly studentRecordService: StudentRecordService,
    ) {}
  
    @Get(':studentId')
    async getStudentRecord(@Param('studentId') studentId: string): Promise<{
      studentId: string;
      version: number;
      grades: CourseGrade[];
      enrollments: CourseEnrollment[];
      degreeProgress: DegreeProgress[];
    }> {
      const studentRecord = await this.studentRecordService.getStudentRecord(studentId);
      return studentRecord.getStudentSnapshot();
    }
  
    @Get(':studentId/history')
    async getStudentRecordAtPoint(
      @Param('studentId') studentId: string,
      @Query('version') version?: number,
      @Query('date') dateStr?: string,
    ): Promise<{
      studentId: string;
      version: number;
      grades: CourseGrade[];
      enrollments: CourseEnrollment[];
      degreeProgress: DegreeProgress[];
      pointInTime: string;
      reconstructionMethod: 'version' | 'date' | 'current';
    }> {
      let studentRecord: StudentRecord;
      let reconstructionMethod: 'version' | 'date' | 'current' = 'current';
      
      if (version !== undefined) {
        studentRecord = await this.studentRecordService.getStudentRecordAtVersion(
          studentId, 
          Number(version)
        );
        reconstructionMethod = 'version';
      } else if (dateStr) {
        const date = new Date(dateStr);
        studentRecord = await this.studentRecordService.getStudentRecordAtDate(studentId, date);
        reconstructionMethod = 'date';
      } else {
        studentRecord = await this.studentRecordService.getStudentRecord(studentId);
      }
      
      const snapshot = studentRecord.getStudentSnapshot();
      
      return {
        ...snapshot,
        pointInTime: reconstructionMethod === 'date' ? dateStr : new Date().toISOString(),
        reconstructionMethod,
      };
    }
  
    @Post(':studentId/grades')
    async recordGrade(
      @Param('studentId') studentId: string,
      @Body() body: {
        courseId: string;
        grade: string;
        points: number;
        semester: string;
        recordedBy: string;
      },
    ): Promise<void> {
      await this.studentRecordService.recordGrade({
        studentId,
        ...body,
      });
    }
  
    @Post(':studentId/grades/:courseId/modify')
    async modifyGrade(
      @Param('studentId') studentId: string,
      @Param('courseId') courseId: string,
      @Body() body: {
        newGrade: string;
        newPoints: number;
        modifiedBy: string;
        reason: string;
      },
    ): Promise<void> {
      await this.studentRecordService.modifyGrade({
        studentId,
        courseId,
        ...body,
      });
    }
  
    @Post(':studentId/enrollments')
    async enrollInCourse(
      @Param('studentId') studentId: string,
      @Body() body: {
        courseId: string;
        semester: string;
        enrollmentDate: Date;
        enrolledBy: string;
      },
    ): Promise<void> {
      await this.studentRecordService.enrollInCourse({
        studentId,
        ...body,
      });
    }
  
    @Post(':studentId/enrollments/:courseId/drop')
    async dropCourse(
      @Param('studentId') studentId: string,
      @Param('courseId') courseId: string,
      @Body() body: {
        semester: string;
        dropDate: Date;
        droppedBy: string;
        reason: string;
      },
    ): Promise<void> {
      await this.studentRecordService.dropCourse({
        studentId,
        courseId,
        ...body,
      });
    }
  
    @Post(':studentId/degree-progress')
    async updateDegreeProgress(
      @Param('studentId') studentId: string,
      @Body() body: {
        degreeId: string;
        creditsEarned: number;
        requirementsFulfilled: string[];
        remainingRequirements: string[];
        projectedCompletionDate: Date;
      },
    ): Promise<void> {
      await this.studentRecordService.updateDegreeProgress({
        studentId,
        ...body,
      });
    }
  }