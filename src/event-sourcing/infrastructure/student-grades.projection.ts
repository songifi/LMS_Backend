import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DomainEvent } from '../../domain/events/base.event';
import { GradeModifiedEvent, GradeRecordedEvent } from '../../domain/events/academic.events';
import { Projection } from './projection.interface';

interface StudentGrade {
  studentId: string;
  courseId: string;
  grade: string;
  points: number;
  semester: string;
  lastUpdated: Date;
}

@Injectable()
export class StudentGradesProjection implements Projection<StudentGrade[]> {
  readonly name = 'student-grades';
  private readonly logger = new Logger(StudentGradesProjection.name);

  constructor(
    @InjectModel('StudentGrade') private readonly studentGradeModel: Model<StudentGrade & Document>,
  ) {}

  async handleEvent(event: DomainEvent): Promise<void> {
    try {
      switch (event.eventType) {
        case 'GradeRecorded':
          await this.handleGradeRecorded(event as GradeRecordedEvent);
          break;
        case 'GradeModified':
          await this.handleGradeModified(event as GradeModifiedEvent);
          break;
      }
    } catch (error) {
      this.logger.error(`Error handling event in ${this.name} projection`, error);
      throw error;
    }
  }

  private async handleGradeRecorded(event: GradeRecordedEvent): Promise<void> {
    await this.studentGradeModel.updateOne(
      {
        studentId: event.studentId,
        courseId: event.courseId,
      },
      {
        studentId: event.studentId,
        courseId: event.courseId,
        grade: event.grade,
        points: event.points,
        semester: event.metadata.semester || 'unknown',
        lastUpdated: event.timestamp,
      },
      { upsert: true }
    );
  }

  private async handleGradeModified(event: GradeModifiedEvent): Promise<void> {
    await this.studentGradeModel.updateOne(
      {
        studentId: event.studentId,
        courseId: event.courseId,
      },
      {
        grade: event.newGrade,
        points: event.newPoints,
        lastUpdated: event.timestamp,
      }
    );
  }

  async getState(): Promise<StudentGrade[]> {
    return this.studentGradeModel.find().lean().exec();
  }

  async reset(): Promise<void> {
    await this.studentGradeModel.deleteMany({});
  }
}
