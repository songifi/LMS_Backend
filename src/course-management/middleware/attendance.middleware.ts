import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSession } from '../entities/course-session.entity';

@Injectable()
export class AttendanceValidationMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(CourseSession)
    private sessionRepository: Repository<CourseSession>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'POST') {
      const { sessionId } = req.body;

      // Validate session exists
      const session = await this.sessionRepository.findOneBy({ id: sessionId });
      if (!session) {
        throw new BadRequestException('Session not found');
      }

      // Validate that session has already started
      if (new Date(session.startTime) > new Date()) {
        throw new BadRequestException('Cannot record attendance for future sessions');
      }

      // Removed student record validation
    }

    next();
  }
}
