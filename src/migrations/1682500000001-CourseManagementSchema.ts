import type { MigrationInterface, QueryRunner } from "typeorm"

export class CourseManagementSchema1682500000001 implements MigrationInterface {
  name = "CourseManagementSchema1682500000001"

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create course_enrollments table
    await queryRunner.query(`
      CREATE TABLE "course_enrollments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "studentId" character varying NOT NULL,
        "courseId" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'ENROLLED',
        "enrollmentDate" TIMESTAMP NOT NULL DEFAULT now(),
        "enrollmentDeadline" TIMESTAMP NOT NULL,
        "completionDate" TIMESTAMP,
        "isActive" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_course_enrollments_id" PRIMARY KEY ("id")
      )
    `)

    // Create indexes for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_course_enrollments_student" ON "course_enrollments" ("studentId")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_course_enrollments_course" ON "course_enrollments" ("courseId")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_course_enrollments_status" ON "course_enrollments" ("status")
    `)

    // Create course_sessions table
    await queryRunner.query(`
      CREATE TABLE "course_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "courseId" character varying NOT NULL,
        "title" character varying NOT NULL,
        "description" text,
        "startTime" TIMESTAMP NOT NULL,
        "endTime" TIMESTAMP NOT NULL,
        "location" character varying NOT NULL,
        "instructorId" character varying NOT NULL,
        "maxCapacity" integer NOT NULL,
        "materials" text,
        CONSTRAINT "PK_course_sessions_id" PRIMARY KEY ("id")
      )
    `)

    // Create indexes for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_course_sessions_course" ON "course_sessions" ("courseId")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_course_sessions_instructor" ON "course_sessions" ("instructorId")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_course_sessions_time" ON "course_sessions" ("startTime", "endTime")
    `)

    // Create course_attendance table
    await queryRunner.query(`
      CREATE TABLE "course_attendance" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sessionId" character varying NOT NULL,
        "studentId" character varying NOT NULL,
        "courseId" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'PRESENT',
        "recordedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "justification" character varying,
        "recordedBy" character varying NOT NULL,
        CONSTRAINT "PK_course_attendance_id" PRIMARY KEY ("id")
      )
    `)

    // Create indexes for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_course_attendance_session" ON "course_attendance" ("sessionId")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_course_attendance_student" ON "course_attendance" ("studentId")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_course_attendance_course" ON "course_attendance" ("courseId")
    `)

    // Create course_progress table
    await queryRunner.query(`
      CREATE TABLE "course_progress" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "enrollmentId" character varying NOT NULL,
        "studentId" character varying NOT NULL,
        "courseId" character varying NOT NULL,
        "percentComplete" decimal(5,2) NOT NULL DEFAULT 0,
        "lastActivityDate" TIMESTAMP NOT NULL,
        "activitiesCompleted" integer NOT NULL DEFAULT 0,
        "totalActivities" integer NOT NULL,
        "deadline" TIMESTAMP NOT NULL,
        "isCompleted" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_course_progress_id" PRIMARY KEY ("id")
      )
    `)

    // Create indexes for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_course_progress_enrollment" ON "course_progress" ("enrollmentId")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_course_progress_student" ON "course_progress" ("studentId")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_course_progress_course" ON "course_progress" ("courseId")
    `)

    // Create course_notifications table
    await queryRunner.query(`
      CREATE TABLE "course_notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "recipientId" character varying NOT NULL,
        "courseId" character varying NOT NULL,
        "sessionId" character varying,
        "type" character varying NOT NULL,
        "message" text NOT NULL,
        "sentAt" TIMESTAMP NOT NULL DEFAULT now(),
        "isRead" boolean NOT NULL DEFAULT false,
        "priority" character varying NOT NULL DEFAULT 'MEDIUM',
        CONSTRAINT "PK_course_notifications_id" PRIMARY KEY ("id")
      )
    `)

    // Create indexes for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_course_notifications_recipient" ON "course_notifications" ("recipientId")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_course_notifications_course" ON "course_notifications" ("courseId")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_course_notifications_read" ON "course_notifications" ("isRead")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order to handle foreign key constraints
    await queryRunner.query(`DROP TABLE "course_notifications"`)
    await queryRunner.query(`DROP TABLE "course_progress"`)
    await queryRunner.query(`DROP TABLE "course_attendance"`)
    await queryRunner.query(`DROP TABLE "course_sessions"`)
    await queryRunner.query(`DROP TABLE "course_enrollments"`)
  }
}
