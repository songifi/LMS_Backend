/**
 * This file documents common migration patterns used in the system
 */

/**
 * Zero-Downtime Migration Pattern
 *
 * This pattern allows schema changes without downtime by following these steps:
 *
 * 1. Deploy new code that works with both old and new schema
 * 2. Apply schema changes in a backward-compatible way
 * 3. Deploy code that works with new schema only
 * 4. Clean up transitional elements
 *
 * Example implementation:
 */
export const zeroDowntimeMigrationExample = `
// Step 1: Deploy code that works with both schemas (already done)

// Step 2: Apply schema changes (in migration)
export const safeUp = async (queryRunner) => {
  // Add new column (nullable first)
  await queryRunner.query(\`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN DEFAULT NULL\`);
  
  // Populate with default values
  await queryRunner.query(\`UPDATE "users" SET "email_verified" = FALSE WHERE "email_verified" IS NULL\`);
  
  // Create index CONCURRENTLY (doesn't block reads/writes)
  await queryRunner.query(\`CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_users_email_verified" ON "users" ("email_verified")\`);
};

// Step 3: Deploy code that uses new schema (separate deployment)

// Step 4: Clean up (in a later migration)
export const finalizeUp = async (queryRunner) => {
  // Make column NOT NULL now that all code expects it
  await queryRunner.query(\`ALTER TABLE "users" ALTER COLUMN "email_verified" SET NOT NULL\`);
};
`

/**
 * Large Table Migration Pattern
 *
 * This pattern allows migrating large tables without locking or performance impact:
 *
 * 1. Create new table with desired schema
 * 2. Set up dual-write mechanism to both tables
 * 3. Migrate existing data in batches
 * 4. Verify data consistency
 * 5. Switch reads to new table
 * 6. Remove old table
 *
 * Example implementation:
 */
export const largeTableMigrationExample = `
// Step 1: Create new table (in migration)
export const up = async (queryRunner) => {
  // Create new table with desired schema
  await queryRunner.query(\`
    CREATE TABLE "users_new" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "email" character varying NOT NULL,
      "name" character varying NOT NULL,
      "email_verified" boolean NOT NULL DEFAULT false,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "pk_users_new" PRIMARY KEY ("id")
    )
  \`);
  
  // Create indexes on new table
  await queryRunner.query(\`CREATE UNIQUE INDEX "idx_users_new_email" ON "users_new" ("email")\`);
  
  // Create trigger function for dual writes
  await queryRunner.query(\`
    CREATE OR REPLACE FUNCTION sync_users_insert()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO users_new (id, email, name, email_verified, created_at, updated_at)
      VALUES (NEW.id, NEW.email, NEW.name, COALESCE(NEW.email_verified, false), NEW.created_at, NEW.updated_at);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    CREATE OR REPLACE FUNCTION sync_users_update()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE users_new SET
        email = NEW.email,
        name = NEW.name,
        email_verified = COALESCE(NEW.email_verified, false),
        updated_at = NEW.updated_at
      WHERE id = NEW.id;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    CREATE OR REPLACE FUNCTION sync_users_delete()
    RETURNS TRIGGER AS $$
    BEGIN
      DELETE FROM users_new WHERE id = OLD.id;
      RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  \`);
  
  // Create triggers for dual writes
  await queryRunner.query(\`
    CREATE TRIGGER users_after_insert
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION sync_users_insert();
    
    CREATE TRIGGER users_after_update
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION sync_users_update();
    
    CREATE TRIGGER users_after_delete
    AFTER DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION sync_users_delete();
  \`);
};

// Step 3: Migrate existing data in batches (separate migration or script)
export const migrateData = async (queryRunner) => {
  const batchSize = 1000;
  let offset = 0;
  let processed = 0;
  
  while (true) {
    // Get batch of users
    const users = await queryRunner.query(\`
      SELECT * FROM users
      ORDER BY id
      LIMIT ${batchSize} OFFSET ${offset}
    \`);
    
    if (users.length === 0) {
      break; // No more users to process
    }
    
    // Process batch
    for (const user of users) {
      await queryRunner.query(\`
        INSERT INTO users_new (id, email, name, email_verified, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      \`, [
        user.id,
        user.email,
        user.name,
        user.email_verified || false,
        user.created_at,
        user.updated_at
      ]);
    }
    
    processed += users.length;
    console.log(\`Processed ${processed} users\`);
    
    offset += batchSize;
  }
};

// Step 4: Verify data consistency
export const verifyConsistency = async (queryRunner) => {
  let oldCount;
  let newCount;
  oldCount = await queryRunner.query(\`SELECT COUNT(*) FROM users\`);
  newCount = await queryRunner.query(\`SELECT COUNT(*) FROM users_new\`);
  
  if (oldCount[0].count !== newCount[0].count) {
    throw new Error(\`Data inconsistency: users has ${oldCount[0].count} rows but users_new has ${newCount[0].count} rows\`);
  }
  
  // Sample verification of specific rows
  const sampleUsersResult = await queryRunner.query(\`
    SELECT id FROM users
    ORDER BY RANDOM()
    LIMIT 100
  \`);
  
  const sampleUsers = sampleUsersResult.map(row => ({ id: row.id }));
  
  for (const sampleUser of sampleUsers) {
    const oldUser = await queryRunner.query(\`SELECT * FROM users WHERE id = $1\`, [sampleUser.id]);
    const newUser = await queryRunner.query(\`SELECT * FROM users_new WHERE id = $1\`, [sampleUser.id]);
    
    if (!oldUser[0] || !newUser[0]) {
      throw new Error(\`User ${sampleUser.id} missing in one of the tables\`);
    }
    
    if (oldUser[0].email !== newUser[0].email || oldUser[0].name !== newUser[0].name) {
      throw new Error(\`Data mismatch for user ${sampleUser.id}\`);
    }
  }
  
  return true;
};

// Step 5 & 6: Switch to new table and clean up (in final migration)
export const switchTables = async (queryRunner) => {
  // Start transaction
  await queryRunner.startTransaction();
  
  try {
    // Drop triggers
    await queryRunner.query(\`
      DROP TRIGGER IF EXISTS users_after_insert ON users;
      DROP TRIGGER IF EXISTS users_after_update ON users;
      DROP TRIGGER IF EXISTS users_after_delete ON users;
    \`);
    
    // Drop trigger functions
    await queryRunner.query(\`
      DROP FUNCTION IF EXISTS sync_users_insert;
      DROP FUNCTION IF EXISTS sync_users_update;
      DROP FUNCTION IF EXISTS sync_users_delete;
    \`);
    
    // Rename tables (atomic operation)
    await queryRunner.query(\`
      ALTER TABLE users RENAME TO users_old;
      ALTER TABLE users_new RENAME TO users;
    \`);
    
    // Update sequence if needed
    
    // Rename constraints and indexes
    await queryRunner.query(\`
      ALTER INDEX pk_users_new RENAME TO pk_users;
      ALTER INDEX idx_users_new_email RENAME TO idx_users_email;
    \`);
    
    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  }
};
`

/**
 * A/B Testing Migration Pattern
 *
 * This pattern allows testing schema changes with a subset of users:
 *
 * 1. Create two schemas: control and experiment
 * 2. Set up routing mechanism to direct traffic
 * 3. Apply changes to experiment schema
 * 4. Collect metrics
 * 5. Analyze results and choose winner
 * 6. Migrate winning schema to production
 *
 * Example implementation is in the ABTestingService
 */

/**
 * Incremental Index Building Pattern
 *
 * This pattern allows adding indexes to large tables without blocking operations:
 *
 * 1. Create index CONCURRENTLY
 * 2. Validate index
 * 3. Add to query planner
 *
 * Example implementation:
 */
export const incrementalIndexExample = `
export const up = async (queryRunner) => {
  // Create index CONCURRENTLY (doesn't block reads/writes)
  await queryRunner.query(\`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_large_table_column" 
    ON "large_table" ("column")
  \`);
  
  // Validate index
  const queryResultRows = await queryRunner.query(\`
    SELECT indexrelid::regclass AS index_name,
           pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
           idx_scan AS index_scans
    FROM pg_stat_user_indexes
    WHERE indexrelid::regclass::text = 'idx_large_table_column'
  \`);
  
  if (!queryResultRows || queryResultRows.length === 0) {
    throw new Error('Index creation failed or index not found');
  }

  const queryResult = queryResultRows[0];
  
  console.log(\`Index created: ${queryResult.index_name}, Size: ${queryResult.index_size}\`);
};

export const down = async (queryRunner) => {
  // Drop index CONCURRENTLY
  await queryRunner.query(\`DROP INDEX CONCURRENTLY IF EXISTS "idx_large_table_column"\`);
};
`
