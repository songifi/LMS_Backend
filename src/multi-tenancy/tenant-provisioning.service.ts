import { Injectable, BadRequestException } from "@nestjs/common"
import type { DataSource } from "typeorm"
import type { TenantService } from "./tenant.service"
import type { CreateTenantDto } from "./dto/create-tenant.dto"
import { type TenantEntity, TenantStatus } from "./entities/tenant.entity"

@Injectable()
export class TenantProvisioningService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly dataSource: DataSource,
  ) {}

  async provisionTenant(createTenantDto: CreateTenantDto): Promise<TenantEntity> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 1. Create the tenant record
      const tenant = await this.tenantService.create(createTenantDto)

      // 2. Set up database-level RLS policies
      await this.setupRlsPolicies(tenant.id, queryRunner)

      // 3. Create initial schema and tables if needed
      await this.initializeTenantSchema(tenant.id, queryRunner)

      // 4. Activate the tenant
      await this.tenantService.update(tenant.id, { status: TenantStatus.ACTIVE })

      await queryRunner.commitTransaction()

      return tenant
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw new BadRequestException(`Failed to provision tenant: ${error.message}`)
    } finally {
      await queryRunner.release()
    }
  }

  private async setupRlsPolicies(tenantId: string, queryRunner: any): Promise<void> {
    // Get all tables that should have RLS policies
    const tables = await this.getTablesForRls(queryRunner)

    for (const table of tables) {
      // Enable RLS on the table if not already enabled
      await queryRunner.query(`
        ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;
      `)

      // Create policy for the tenant
      await queryRunner.query(`
        CREATE POLICY tenant_isolation_policy_${table.replace(".", "_")}
        ON ${table}
        USING (tenant_id = '${tenantId}' OR tenant_id IS NULL);
      `)
    }
  }

  private async getTablesForRls(queryRunner: any): Promise<string[]> {
    // Get all tables in the public schema that have a tenant_id column
    const result = await queryRunner.query(`
      SELECT table_schema || '.' || table_name as table_name
      FROM information_schema.columns
      WHERE column_name = 'tenant_id'
      AND table_schema NOT IN ('pg_catalog', 'information_schema')
    `)

    return result.map((row) => row.table_name)
  }

  private async initializeTenantSchema(tenantId: string, queryRunner: any): Promise<void> {
    // Create tenant-specific schema if needed
    // This is optional - you can use a single schema with RLS instead
    await queryRunner.query(`
      -- Initialize any tenant-specific data or settings
      INSERT INTO tenant_initialization_log (tenant_id, initialized_at)
      VALUES ('${tenantId}', NOW());
    `)
  }

  async deprovisionTenant(tenantId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 1. Mark tenant as archived
      await this.tenantService.update(tenantId, { status: TenantStatus.ARCHIVED })

      // 2. Remove RLS policies
      await this.removeRlsPolicies(tenantId, queryRunner)

      // 3. Schedule data deletion (or perform it immediately for small tenants)
      await this.scheduleTenantDataDeletion(tenantId, queryRunner)

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw new BadRequestException(`Failed to deprovision tenant: ${error.message}`)
    } finally {
      await queryRunner.release()
    }
  }

  private async removeRlsPolicies(tenantId: string, queryRunner: any): Promise<void> {
    const tables = await this.getTablesForRls(queryRunner)

    for (const table of tables) {
      await queryRunner.query(`
        DROP POLICY IF EXISTS tenant_isolation_policy_${table.replace(".", "_")} ON ${table};
      `)
    }
  }

  private async scheduleTenantDataDeletion(tenantId: string, queryRunner: any): Promise<void> {
    // Schedule data deletion after a retention period
    await queryRunner.query(`
      INSERT INTO tenant_deletion_queue (tenant_id, scheduled_deletion_date)
      VALUES ('${tenantId}', NOW() + INTERVAL '30 days');
    `)
  }
}
