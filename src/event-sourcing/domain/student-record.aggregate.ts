import { AggregateRoot } from './aggregate-root';
import { 
  CourseDropEvent, 
  CourseEnrollmentEvent, 
  DegreeProgressUpdatedEvent, 
  GradeModifiedEvent, 
  GradeRecordedEvent 
} from './events/academic.events';

export interface CourseGrade {
  courseId: string;
  grade: string;
  points: number;
  semester: string;
}

export interface CourseEnrollment {
  courseId: string;
  semester: string;
  enrollmentDate: Date;
  status: 'enrolled' | 'dropped' | 'completed';
  dropDate?: Date;
  dropReason?: string;
}

export interface DegreeProgress {
  degreeId: string;
  creditsEarned: number;
  requirementsFulfilled: string[];
  remainingRequirements: string[];
  projectedCompletionDate: Date;
}

export class StudentRecord extends AggregateRoot {
  private _studentId: string;
  private _grades: Map<string, CourseGrade> = new Map();
  private _enrollments: Map<string, CourseEnrollment> = new Map();
  private _degreeProgress: Map<string, DegreeProgress> = new Map();

  constructor(studentId: string) {
    super(studentId);
    this._studentId = studentId;
  }

  // Command methods
  recordGrade(params: {
    courseId: string;
    grade: string;
    points: number;
    recordedBy: string;
    semester: string;
    metadata?: Record<string, any>;
  }): void {
    const event = new GradeRecordedEvent({
      aggregateId: this.id,
      version: this.version + 1,
      studentId: this._studentId,
      courseId: params.courseId,
      grade: params.grade,
      points: params.points,
      recordedBy: params.recordedBy,
      metadata: params.metadata,
    });

    this.applyEvent(event);
  }

  modifyGrade(params: {
    courseId: string;
    newGrade: string;
    newPoints: number;
    modifiedBy: string;
    reason: string;
    metadata?: Record<string, any>;
  }): void {
    const courseKey = params.courseId;
    if (!this._grades.has(courseKey)) {
      throw new Error(`No grade record found for course ${params.courseId}`);
    }

    const currentGrade = this._grades.get(courseKey);
    const event = new GradeModifiedEvent({
      aggregateId: this.id,
      version: this.version + 1,
      studentId: this._studentId,
      courseId: params.courseId,
      previousGrade: currentGrade.grade,
      newGrade: params.newGrade,
      previousPoints: currentGrade.points,
      newPoints: params.newPoints,
      modifiedBy: params.modifiedBy,
      reason: params.reason,
      metadata: params.metadata,
    });

    this.applyEvent(event);
  }

  enrollInCourse(params: {
    courseId: string;
    semester: string;
    enrollmentDate: Date;
    enrolledBy: string;
    metadata?: Record<string, any>;
  }): void {
    const event = new CourseEnrollmentEvent({
      aggregateId: this.id,
      version: this.version + 1,
      studentId: this._studentId,
      courseId: params.courseId,
      semester: params.semester,
      enrollmentDate: params.enrollmentDate,
      enrolledBy: params.enrolledBy,
      metadata: params.metadata,
    });

    this.applyEvent(event);
  }

  dropCourse(params: {
    courseId: string;
    semester: string;
    dropDate: Date;
    droppedBy: string;
    reason: string;
    metadata?: Record<string, any>;
  }): void {
    const enrollmentKey = `${params.courseId}-${params.semester}`;
    if (!this._enrollments.has(enrollmentKey) || 
        this._enrollments.get(enrollmentKey).status !== 'enrolled') {
      throw new Error(`Student is not enrolled in course ${params.courseId} for semester ${params.semester}`);
    }

    const event = new CourseDropEvent({
      aggregateId: this.id,
      version: this.version + 1,
      studentId: this._studentId,
      courseId: params.courseId,
      semester: params.semester,
      dropDate: params.dropDate,
      droppedBy: params.droppedBy,
      reason: params.reason,
      metadata: params.metadata,
    });

    this.applyEvent(event);
  }

  updateDegreeProgress(params: {
    degreeId: string;
    creditsEarned: number;
    requirementsFulfilled: string[];
    remainingRequirements: string[];
    projectedCompletionDate: Date;
    metadata?: Record<string, any>;
  }): void {
    const event = new DegreeProgressUpdatedEvent({
      aggregateId: this.id,
      version: this.version + 1,
      studentId: this._studentId,
      degreeId: params.degreeId,
      creditsEarned: params.creditsEarned,
      requirementsFulfilled: params.requirementsFulfilled,
      remainingRequirements: params.remainingRequirements,
      projectedCompletionDate: params.projectedCompletionDate,
      metadata: params.metadata,
    });

    this.applyEvent(event);
  }

  // Event handlers
  onGradeRecorded(event: GradeRecordedEvent): void {
    const courseKey = event.courseId;
    this._grades.set(courseKey, {
      courseId: event.courseId,
      grade: event.grade,
      points: event.points,
      semester: event.metadata.semester || 'unknown',
    });

    // Update enrollment status if it exists
    if (event.metadata.semester) {
      const enrollmentKey = `${event.courseId}-${event.metadata.semester}`;
      if (this._enrollments.has(enrollmentKey)) {
        const enrollment = this._enrollments.get(enrollmentKey);
        this._enrollments.set(enrollmentKey, {
          ...enrollment,
          status: 'completed',
        });
      }
    }
  }

  onGradeModified(event: GradeModifiedEvent): void {
    const courseKey = event.courseId;
    if (this._grades.has(courseKey)) {
      const currentGrade = this._grades.get(courseKey);
      this._grades.set(courseKey, {
        ...currentGrade,
        grade: event.newGrade,
        points: event.newPoints,
      });
    }
  }

  onCourseEnrollment(event: CourseEnrollmentEvent): void {
    const enrollmentKey = `${event.courseId}-${event.semester}`;
    this._enrollments.set(enrollmentKey, {
      courseId: event.courseId,
      semester: event.semester,
      enrollmentDate: event.enrollmentDate,
      status: 'enrolled',
    });
  }

  onCourseDrop(event: CourseDropEvent): void {
    const enrollmentKey = `${event.courseId}-${event.semester}`;
    if (this._enrollments.has(enrollmentKey)) {
      const enrollment = this._enrollments.get(enrollmentKey);
      this._enrollments.set(enrollmentKey, {
        ...enrollment,
        status: 'dropped',
        dropDate: event.dropDate,
        dropReason: event.reason,
      });
    }
  }

  onDegreeProgressUpdated(event: DegreeProgressUpdatedEvent): void {
    this._degreeProgress.set(event.degreeId, {
      degreeId: event.degreeId,
      creditsEarned: event.creditsEarned,
      requirementsFulfilled: event.requirementsFulfilled,
      remainingRequirements: event.remainingRequirements,
      projectedCompletionDate: event.projectedCompletionDate,
    });
  }

  // Query methods
  getGrades(): CourseGrade[] {
    return Array.from(this._grades.values());
  }

  getEnrollments(): CourseEnrollment[] {
    return Array.from(this._enrollments.values());
  }

  getDegreeProgress(): DegreeProgress[] {
    return Array.from(this._degreeProgress.values());
  }

  getStudentSnapshot(): {
    studentId: string;
    version: number;
    grades: CourseGrade[];
    enrollments: CourseEnrollment[];
    degreeProgress: DegreeProgress[];
  } {
    return {
      studentId: this._studentId,
      version: this.version,
      grades: this.getGrades(),
      enrollments: this.getEnrollments(),
      degreeProgress: this.getDegreeProgress(),
    };
  }
}