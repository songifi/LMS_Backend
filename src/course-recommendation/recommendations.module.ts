import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { Recommendation } from './entities/recommendation.entity';
import { Student } from '../students/entities/student.entity';
import { Course } from '../../courses/entities/course.entity';
import { Algorithm } from '../../algorithms/entities/algorithm.entity';
import { Enrollment } from '../students/entities/enrollment.entity';
import { DegreeRequirement } from '../../degree-audit/entities/degree-requirement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recommendation, 
      Student, 
      Course, 
      Algorithm, 
      Enrollment, 
      DegreeRequirement
    ]),
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}