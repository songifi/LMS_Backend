import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEnrollment } from '../entities/course-enrollment.entity';

@Injectable()
export class EnrollmentValidationMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(CourseEnrollment)
    private enrollmentRepository: Repository<CourseEnrollment>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'POST') {
      const { courseId, studentId } = req.body;

      // Check if student is already enrolled
      const existingEnrollment = await this.enrollmentRepository.findOne({
        where: {
          studentId,
          courseId,
          isActive: true,
        },
      });

      if (existingEnrollment) {
        throw new BadRequestException('Student is already enrolled in this course');
      }

      // NOTE: You must validate course elsewhere or inject the courseRepository if still needed
    }

    next();
  }
}
