import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexes1682500000002 implements MigrationInterface {
  name = 'AddIndexes1682500000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // User search indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_first_name" ON "users" ("firstName");
      CREATE INDEX IF NOT EXISTS "IDX_users_last_name" ON "users" ("lastName");
      CREATE INDEX IF NOT EXISTS "IDX_users_faculty_affiliation" ON "users" ("facultyAffiliation");
      CREATE INDEX IF NOT EXISTS "IDX_users_is_active" ON "users" ("isActive");
    `);

    // Faculty indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_faculties_name" ON "faculties" ("name");
      CREATE INDEX IF NOT EXISTS "IDX_faculties_code" ON "faculties" ("code");
      CREATE INDEX IF NOT EXISTS "IDX_faculties_faculty_head_id" ON "faculties" ("faculty_head_id");
    `);

    // Department indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_departments_name" ON "departments" ("name");
      CREATE INDEX IF NOT EXISTS "IDX_departments_code" ON "departments" ("code");
      CREATE INDEX IF NOT EXISTS "IDX_departments_faculty_id" ON "departments" ("faculty_id");
      CREATE INDEX IF NOT EXISTS "IDX_departments_department_head_id" ON "departments" ("department_head_id");
    `);

    // Faculty administrators indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_faculty_administrators_faculty_id" ON "faculty_administrators" ("faculty_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all the indexes created
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_users_first_name";
      DROP INDEX IF EXISTS "IDX_users_last_name";
      DROP INDEX IF EXISTS "IDX_users_faculty_affiliation";
      DROP INDEX IF EXISTS "IDX_users_is_active";

      DROP INDEX IF EXISTS "IDX_faculties_name";
      DROP INDEX IF EXISTS "IDX_faculties_code";
      DROP INDEX IF EXISTS "IDX_faculties_faculty_head_id";

      DROP INDEX IF EXISTS "IDX_departments_name";
      DROP INDEX IF EXISTS "IDX_departments_code";
      DROP INDEX IF EXISTS "IDX_departments_faculty_id";
      DROP INDEX IF EXISTS "IDX_departments_department_head_id";

      DROP INDEX IF EXISTS "IDX_faculty_administrators_faculty_id";
    `);
  }
}
