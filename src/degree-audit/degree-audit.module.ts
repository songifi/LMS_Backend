import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DegreeAuditService } from './degree-audit.service';
import { DegreeAuditController } from './degree-audit.controller';
import { DegreeProgram } from './entities/degree-program.entity';
import { DegreeRequirement } from './entities/degree-requirement.entity';
import { Course } from '../courses/entities/course.entity';
import { Student } from '../students/entities/student.entity';
import { Enrollment } from '../students/entities/enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DegreeProgram, DegreeRequirement, Course, Student, Enrollment])],
  controllers: [DegreeAuditController],
  providers: [DegreeAuditService],
  exports: [DegreeAuditService],
})
export class DegreeAuditModule {}