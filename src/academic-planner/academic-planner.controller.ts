import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AcademicPlannerService } from './academic-planner.service';
import { AddCourseDto } from './dto/add-course.dto';
import { ValidatePrerequisiteDto } from './dto/validate-prerequisite.dto';
import { CheckConflictsDto } from './dto/check-conflicts.dto';
import { ExportCalendarDto } from './dto/export-calendar.dto';

@Controller('planner')
export class AcademicPlannerController {
  constructor(private readonly plannerService: AcademicPlannerService) {}

  @Post(':studentId/semesters')
  addCourse(@Param('studentId') studentId: string, @Body() dto: AddCourseDto) {
    return this.plannerService.addCourseToSemester(studentId, dto);
  }

  @Post(':studentId/validate-prerequisites')
  validate(@Param('studentId') studentId: string, @Body() dto: ValidatePrerequisiteDto) {
    return this.plannerService.validatePrerequisites(studentId, dto);
  }

  @Post(':studentId/check-conflicts')
  checkConflicts(@Param('studentId') studentId: string, @Body() dto: CheckConflictsDto) {
    return this.plannerService.detectConflicts(studentId, dto);
  }

  @Get('courses/:courseId/predict-availability')
  predict(@Param('courseId') courseId: string) {
    return this.plannerService.predictAvailability(courseId);
  }

  @Post(':studentId/export-calendar')
  export(@Param('studentId') studentId: string, @Body() dto: ExportCalendarDto) {
    return this.plannerService.exportCalendar(studentId, dto);
  }

  @Get(':studentId/degree-progress')
  progress(@Param('studentId') studentId: string) {
    return this.plannerService.trackDegreeProgress(studentId);
  }
}
