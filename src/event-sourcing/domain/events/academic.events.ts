import { DomainEvent } from './base.event';

export class GradeRecordedEvent extends DomainEvent {
  readonly studentId: string;
  readonly courseId: string;
  readonly grade: string;
  readonly points: number;
  readonly recordedBy: string;

  constructor(params: {
    aggregateId: string;
    version: number;
    studentId: string;
    courseId: string;
    grade: string;
    points: number;
    recordedBy: string;
    metadata?: Record<string, any>;
  }) {
    super({
      aggregateId: params.aggregateId,
      aggregateType: 'StudentRecord',
      version: params.version,
      eventType: 'GradeRecorded',
      metadata: params.metadata,
    });
    this.studentId = params.studentId;
    this.courseId = params.courseId;
    this.grade = params.grade;
    this.points = params.points;
    this.recordedBy = params.recordedBy;
  }
}

export class GradeModifiedEvent extends DomainEvent {
  readonly studentId: string;
  readonly courseId: string;
  readonly previousGrade: string;
  readonly newGrade: string;
  readonly previousPoints: number;
  readonly newPoints: number;
  readonly modifiedBy: string;
  readonly reason: string;

  constructor(params: {
    aggregateId: string;
    version: number;
    studentId: string;
    courseId: string;
    previousGrade: string;
    newGrade: string;
    previousPoints: number;
    newPoints: number;
    modifiedBy: string;
    reason: string;
    metadata?: Record<string, any>;
  }) {
    super({
      aggregateId: params.aggregateId,
      aggregateType: 'StudentRecord',
      version: params.version,
      eventType: 'GradeModified',
      metadata: params.metadata,
    });
    this.studentId = params.studentId;
    this.courseId = params.courseId;
    this.previousGrade = params.previousGrade;
    this.newGrade = params.newGrade;
    this.previousPoints = params.previousPoints;
    this.newPoints = params.newPoints;
    this.modifiedBy = params.modifiedBy;
    this.reason = params.reason;
  }
}

export class CourseEnrollmentEvent extends DomainEvent {
  readonly studentId: string;
  readonly courseId: string;
  readonly semester: string;
  readonly enrollmentDate: Date;
  readonly enrolledBy: string;

  constructor(params: {
    aggregateId: string;
    version: number;
    studentId: string;
    courseId: string;
    semester: string;
    enrollmentDate: Date;
    enrolledBy: string;
    metadata?: Record<string, any>;
  }) {
    super({
      aggregateId: params.aggregateId,
      aggregateType: 'StudentRecord',
      version: params.version,
      eventType: 'CourseEnrollment',
      metadata: params.metadata,
    });
    this.studentId = params.studentId;
    this.courseId = params.courseId;
    this.semester = params.semester;
    this.enrollmentDate = params.enrollmentDate;
    this.enrolledBy = params.enrolledBy;
  }
}

export class CourseDropEvent extends DomainEvent {
  readonly studentId: string;
  readonly courseId: string;
  readonly semester: string;
  readonly dropDate: Date;
  readonly droppedBy: string;
  readonly reason: string;

  constructor(params: {
    aggregateId: string;
    version: number;
    studentId: string;
    courseId: string;
    semester: string;
    dropDate: Date;
    droppedBy: string;
    reason: string;
    metadata?: Record<string, any>;
  }) {
    super({
      aggregateId: params.aggregateId,
      aggregateType: 'StudentRecord',
      version: params.version,
      eventType: 'CourseDrop',
      metadata: params.metadata,
    });
    this.studentId = params.studentId;
    this.courseId = params.courseId;
    this.semester = params.semester;
    this.dropDate = params.dropDate;
    this.droppedBy = params.droppedBy;
    this.reason = params.reason;
  }
}

export class DegreeProgressUpdatedEvent extends DomainEvent {
  readonly studentId: string;
  readonly degreeId: string;
  readonly creditsEarned: number;
  readonly requirementsFulfilled: string[];
  readonly remainingRequirements: string[];
  readonly projectedCompletionDate: Date;

  constructor(params: {
    aggregateId: string;
    version: number;
    studentId: string;
    degreeId: string;
    creditsEarned: number;
    requirementsFulfilled: string[];
    remainingRequirements: string[];
    projectedCompletionDate: Date;
    metadata?: Record<string, any>;
  }) {
    super({
      aggregateId: params.aggregateId,
      aggregateType: 'StudentRecord',
      version: params.version,
      eventType: 'DegreeProgressUpdated',
      metadata: params.metadata,
    });
    this.studentId = params.studentId;
    this.degreeId = params.degreeId;
    this.creditsEarned = params.creditsEarned;
    this.requirementsFulfilled = params.requirementsFulfilled;
    this.remainingRequirements = params.remainingRequirements;
    this.projectedCompletionDate = params.projectedCompletionDate;
  }
}