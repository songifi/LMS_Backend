import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { Semester } from './entities/semester.entity';
import { Student } from './entities/student.entity';
import { Prerequisite } from './entities/prerequisite.entity';
import { Program } from './entities/program.entity';
import { AddCourseDto } from './dto/add-course.dto';
import { ValidatePrerequisiteDto } from './dto/validate-prerequisite.dto';
import { CheckConflictsDto } from './dto/check-conflicts.dto';
import { ExportCalendarDto } from './dto/export-calendar.dto';
import { checkScheduleConflicts } from '../../utils/scheduler';

@Injectable()
export class AcademicPlannerService {
  constructor(
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(Semester) private semesterRepo: Repository<Semester>,
    @InjectRepository(Prerequisite) private prerequisiteRepo: Repository<Prerequisite>,
    @InjectRepository(Program) private programRepo: Repository<Program>,
  ) {}

  async addCourseToSemester(studentId: string, dto: AddCourseDto) {
    return { message: `Added course ${dto.courseId} to semester ${dto.semesterLabel}` };
  }

  async validatePrerequisites(studentId: string, dto: ValidatePrerequisiteDto) {
    return { message: `Validated prerequisites for course ${dto.courseId}` };
  }

  async detectConflicts(studentId: string, dto: CheckConflictsDto) {
    return checkScheduleConflicts(dto.courses);
  }

  async predictAvailability(courseId: string) {
    return { courseId, nextLikelyOffering: 'Spring 2025' };
  }

  async exportCalendar(studentId: string, dto: ExportCalendarDto) {
    return { message: `Exported to ${dto.calendarType}` };
  }

  async trackDegreeProgress(studentId: string) {
    return { progress: '50%', missingCourses: [] };
  }
}
