import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicPlannerService } from './academic-planner.service';
import { AcademicPlannerController } from './academic-planner.controller';
import { Course } from './entities/course.entity';
import { Semester } from './entities/semester.entity';
import { Student } from './entities/student.entity';
import { Prerequisite } from './entities/prerequisite.entity';
import { Program } from './entities/program.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Semester, Student, Prerequisite, Program])],
  controllers: [AcademicPlannerController],
  providers: [AcademicPlannerService],
})
export class AcademicPlannerModule {}
