import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CourseSession } from '../entities/course-session.entity';
import { CreateSessionDto } from '../dto/create-session.dto';
import { FilterSessionsDto } from '../dto/filter-sessions.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(CourseSession)
    private sessionRepository: Repository<CourseSession>,
  ) {}

  async createSession(createSessionDto: CreateSessionDto): Promise<CourseSession> {
    const session = this.sessionRepository.create(createSessionDto);
    return this.sessionRepository.save(session);
  }

  async getSessions(filters: FilterSessionsDto): Promise<CourseSession[]> {
    const queryBuilder = this.sessionRepository.createQueryBuilder('session');
    
    if (filters.courseId) {
      queryBuilder.andWhere('session.courseId = :courseId', { courseId: filters.courseId });
    }
    
    // Filter by date range if provided
    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('session.startTime BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    } else if (filters.startDate) {
      queryBuilder.andWhere('session.startTime >= :startDate', { startDate: filters.startDate });
    } else if (filters.endDate) {
      queryBuilder.andWhere('session.startTime <= :endDate', { endDate: filters.endDate });
    }
    
    queryBuilder.leftJoinAndSelect('session.instructor', 'instructor');
    queryBuilder.orderBy('session.startTime', 'ASC');
    
    return queryBuilder.getMany();
  }

  async updateSession(id: string, updateSessionDto: any): Promise<CourseSession> {
    await this.sessionRepository.update(id, updateSessionDto);
    const updatedSession = await this.sessionRepository.findOneBy({ id });
    
    if (!updatedSession) {
      throw new Error(`Session with id ${id} not found`);
    }
    
    return updatedSession;
  }

  async deleteSession(id: string): Promise<void> {
    await this.sessionRepository.delete(id);
  }
}