import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { Course } from '../../course/entities/course.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class SessionValidationMiddleware implements NestMiddleware {
  constructor(
    // @InjectRepository(Course)
    // private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'POST') {
      const { courseId, instructorId, startTime, endTime } = req.body;

      // Validate course exists
    //   const course = await this.courseRepository.findOneBy({ id: courseId });
    //   if (!course) {
    //     throw new BadRequestException('Course not found');
    //   }

      // Validate instructor exists
      const instructor = await this.userRepository.findOneBy({ id: instructorId });
      if (!instructor) {
        throw new BadRequestException('Instructor not found');
      }

      // Validate time range
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (start >= end) {
        throw new BadRequestException('Session end time must be after start time');
      }
    }

    next();
  }
}