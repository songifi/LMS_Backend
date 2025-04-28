import type { MigrationInterface, QueryRunner } from "typeorm"

export class InitialSchema1682500000000 implements MigrationInterface {
  name = "InitialSchema1682500000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create roles table with indexes
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "description" character varying,
        CONSTRAINT "PK_roles_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name")
      )
    `)

    // Create permissions table with indexes
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "description" character varying,
        CONSTRAINT "PK_permissions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_permissions_name" UNIQUE ("name")
      )
    `)

    // Create role_permissions junction table
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "roleId" integer NOT NULL,
        "permissionId" integer NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("roleId", "permissionId"),
        CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_role_permissions_permission" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE
      )
    `)

    // Create users table with indexes
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "firstName" character varying(100) NOT NULL,
        "lastName" character varying(100) NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "profileImage" character varying,
        "facultyAffiliation" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `)

    // Create index on email for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email")
    `)

    // Create user_roles junction table
    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "userId" integer NOT NULL,
        "roleId" integer NOT NULL,
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("userId", "roleId"),
        CONSTRAINT "FK_user_roles_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_roles_role" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE
      )
    `)

    // Create email_verifications table
    await queryRunner.query(`
      CREATE TABLE "email_verifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "token" character varying NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" integer,
        CONSTRAINT "PK_email_verifications_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_email_verifications_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `)

    // Create index on token for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_email_verifications_token" ON "email_verifications" ("token")
    `)

    // Create password_resets table
    await queryRunner.query(`
      CREATE TABLE "password_resets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "token" character varying NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" integer,
        CONSTRAINT "PK_password_resets_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_password_resets_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `)

    // Create index on token for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_password_resets_token" ON "password_resets" ("token")
    `)

    // Create refresh_tokens table
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "token" character varying NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "isRevoked" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" integer,
        "userAgent" character varying,
        "ipAddress" character varying,
        CONSTRAINT "PK_refresh_tokens_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_tokens_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `)

    // Create index on token for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_refresh_tokens_token" ON "refresh_tokens" ("token")
    `)

    // Insert default roles
    await queryRunner.query(`
      INSERT INTO "roles" ("name", "description") VALUES 
      ('SUPER_ADMIN', 'Super administrator with full access'),
      ('ADMIN', 'Administrator with system-wide access'),
      ('FACULTY_ADMIN', 'Faculty administrator'),
      ('DEPARTMENT_ADMIN', 'Department administrator'),
      ('INSTRUCTOR', 'Course instructor'),
      ('STUDENT', 'Student user'),
      ('MODERATOR', 'Forum moderator')
    `)

    // Insert default permissions
    await queryRunner.query(`
      INSERT INTO "permissions" ("name", "description") VALUES 
      ('user:create', 'Create users'),
      ('user:read', 'Read user data'),
      ('user:update', 'Update user data'),
      ('user:delete', 'Delete users'),
      ('course:create', 'Create courses'),
      ('course:read', 'Read course data'),
      ('course:update', 'Update course data'),
      ('course:delete', 'Delete courses'),
      ('content:create', 'Create content'),
      ('content:read', 'Read content'),
      ('content:update', 'Update content'),
      ('content:delete', 'Delete content'),
      ('assessment:create', 'Create assessments'),
      ('assessment:read', 'Read assessments'),
      ('assessment:update', 'Update assessments'),
      ('assessment:delete', 'Delete assessments'),
      ('forum:moderate', 'Moderate forum posts')
    `)

    // Assign permissions to roles
    await queryRunner.query(`
      -- Super Admin gets all permissions
      INSERT INTO "role_permissions" ("roleId", "permissionId")
      SELECT 1, id FROM "permissions";
      
      -- Admin gets most permissions
      INSERT INTO "role_permissions" ("roleId", "permissionId")
      SELECT 2, id FROM "permissions";
      
      -- Faculty Admin permissions
      INSERT INTO "role_permissions" ("roleId", "permissionId")
      SELECT 3, id FROM "permissions" WHERE "name" IN (
        'user:read', 'course:create', 'course:read', 'course:update',
        'content:read', 'assessment:read', 'forum:moderate'
      );
      
      -- Department Admin permissions
      INSERT INTO "role_permissions" ("roleId", "permissionId")
      SELECT 4, id FROM "permissions" WHERE "name" IN (
        'user:read', 'course:read', 'course:update',
        'content:read', 'assessment:read'
      );
      
      -- Instructor permissions
      INSERT INTO "role_permissions" ("roleId", "permissionId")
      SELECT 5, id FROM "permissions" WHERE "name" IN (
        'course:read', 'content:create', 'content:read', 'content:update',
        'assessment:create', 'assessment:read', 'assessment:update'
      );
      
      -- Student permissions
      INSERT INTO "role_permissions" ("roleId", "permissionId")
      SELECT 6, id FROM "permissions" WHERE "name" IN (
        'course:read', 'content:read', 'assessment:read'
      );
      
      -- Moderator permissions
      INSERT INTO "role_permissions" ("roleId", "permissionId")
      SELECT 7, id FROM "permissions" WHERE "name" IN (
        'forum:moderate'
      );
    `)

    // Create a default admin user with hashed password 'admin123'
    await queryRunner.query(`
      INSERT INTO "users" ("firstName", "lastName", "email", "password", "isActive")
      VALUES ('Admin', 'User', 'admin@lms.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', true)
    `)

    // Assign SUPER_ADMIN role to the admin user
    await queryRunner.query(`
      INSERT INTO "user_roles" ("userId", "roleId")
      VALUES (1, 1)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order to handle foreign key constraints
    await queryRunner.query(`DROP TABLE "user_roles"`)
    await queryRunner.query(`DROP TABLE "role_permissions"`)
    await queryRunner.query(`DROP TABLE "refresh_tokens"`)
    await queryRunner.query(`DROP TABLE "password_resets"`)
    await queryRunner.query(`DROP TABLE "email_verifications"`)
    await queryRunner.query(`DROP TABLE "users"`)
    await queryRunner.query(`DROP TABLE "permissions"`)
    await queryRunner.query(`DROP TABLE "roles"`)
  }
}
