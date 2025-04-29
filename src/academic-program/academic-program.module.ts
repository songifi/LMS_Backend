import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramService } from './providers/academic-program.service';
import { ProgramController } from './controllers/academic-program.controller';
import { Program } from './entities/academic-program.entity';
import { Curriculum } from './entities/curriculum.entity';
import { Requirement } from './entities/requirement.entity';
import { CourseSequence } from './entities/course-sequence.entity';
import { ProgramOutcome } from './entities/program-outcome.entity';
import { CurriculumVersion } from './entities/curriculum-version.entity';
import { ProgramEnrollment } from './entities/program-enrollment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Program,
      Curriculum,
      Requirement,
      CourseSequence,
      ProgramOutcome,
      CurriculumVersion,
      ProgramEnrollment,
    ]),
  ],
  controllers: [ProgramController],
  providers: [ProgramService],
})
export class AcademicProgramModule {}
