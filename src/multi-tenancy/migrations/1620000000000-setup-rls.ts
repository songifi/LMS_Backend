import type { MigrationInterface, QueryRunner } from "typeorm"

export class SetupRls1620000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create function to set up RLS for a tenant
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION setup_tenant_rls(tenant_uuid UUID)
      RETURNS VOID AS $$
      DECLARE
        table_record RECORD;
      BEGIN
        -- Create app parameter for current tenant
        EXECUTE 'SET app.current_tenant_id = ''' || tenant_uuid || '''';
        
        -- Loop through all tables with tenant_id column
        FOR table_record IN 
          SELECT table_schema, table_name
          FROM information_schema.columns
          WHERE column_name = 'tenant_id'
          AND table_schema NOT IN ('pg_catalog', 'information_schema')
        LOOP
          -- Enable RLS on the table
          EXECUTE 'ALTER TABLE ' || table_record.table_schema || '.' || table_record.table_name || ' ENABLE ROW LEVEL SECURITY';
          
          -- Create policy for the tenant
          EXECUTE 'DROP POLICY IF EXISTS tenant_isolation_policy ON ' || 
                  table_record.table_schema || '.' || table_record.table_name;
                  
          EXECUTE 'CREATE POLICY tenant_isolation_policy ON ' || 
                  table_record.table_schema || '.' || table_record.table_name || 
                  ' USING (tenant_id = ''' || tenant_uuid || ''' OR tenant_id IS NULL)';
        END LOOP;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Create function to disable RLS for a tenant
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION disable_tenant_rls(tenant_uuid UUID)
      RETURNS VOID AS $$
      DECLARE
        table_record RECORD;
      BEGIN
        -- Loop through all tables with tenant_id column
        FOR table_record IN 
          SELECT table_schema, table_name
          FROM information_schema.columns
          WHERE column_name = 'tenant_id'
          AND table_schema NOT IN ('pg_catalog', 'information_schema')
        LOOP
          -- Disable the policy for this tenant
          EXECUTE 'DROP POLICY IF EXISTS tenant_isolation_policy ON ' || 
                  table_record.table_schema || '.' || table_record.table_name;
        END LOOP;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Create function to remove RLS for a tenant
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION remove_tenant_rls(tenant_uuid UUID)
      RETURNS VOID AS $$
      BEGIN
        -- Call disable function first
        PERFORM disable_tenant_rls(tenant_uuid);
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Create function to delete tenant data
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION delete_tenant_data(tenant_uuid UUID)
      RETURNS VOID AS $$
      DECLARE
        table_record RECORD;
      BEGIN
        -- Loop through all tables with tenant_id column
        FOR table_record IN 
          SELECT table_schema, table_name
          FROM information_schema.columns
          WHERE column_name = 'tenant_id'
          AND table_schema NOT IN ('pg_catalog', 'information_schema')
        LOOP
          -- Delete data for this tenant
          EXECUTE 'DELETE FROM ' || 
                  table_record.table_schema || '.' || table_record.table_name || 
                  ' WHERE tenant_id = ''' || tenant_uuid || '''';
        END LOOP;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Create tables for tenant management
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tenant_initialization_log (
        id SERIAL PRIMARY KEY,
        tenant_id UUID NOT NULL,
        initialized_at TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS tenant_deletion_queue (
        id SERIAL PRIMARY KEY,
        tenant_id UUID NOT NULL,
        scheduled_deletion_date TIMESTAMP NOT NULL,
        processed BOOLEAN DEFAULT FALSE
      );
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop functions
    await queryRunner.query(`DROP FUNCTION IF EXISTS setup_tenant_rls(UUID);`)
    await queryRunner.query(`DROP FUNCTION IF EXISTS disable_tenant_rls(UUID);`)
    await queryRunner.query(`DROP FUNCTION IF EXISTS remove_tenant_rls(UUID);`)
    await queryRunner.query(`DROP FUNCTION IF EXISTS delete_tenant_data(UUID);`)

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS tenant_initialization_log;`)
    await queryRunner.query(`DROP TABLE IF EXISTS tenant_deletion_queue;`)
  }
}
