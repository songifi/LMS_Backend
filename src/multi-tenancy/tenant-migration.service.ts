import { Injectable, BadRequestException } from "@nestjs/common"
import type { DataSource } from "typeorm"
import type { TenantService } from "./tenant.service"
import * as fs from "fs"
import * as path from "path"

@Injectable()
export class TenantMigrationService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly dataSource: DataSource,
  ) {}

  async exportTenantData(tenantId: string, outputPath: string): Promise<string> {
    const tenant = await this.tenantService.findById(tenantId)

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()

    try {
      // Get all tables with tenant data
      const tables = await this.getTablesWithTenantData(queryRunner)

      const exportData = {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          config: tenant.config,
        },
        data: {},
      }

      // Export data from each table
      for (const table of tables) {
        const tableData = await queryRunner.query(`
          SELECT * FROM ${table}
          WHERE tenant_id = '${tenantId}'
        `)

        exportData.data[table] = tableData
      }

      // Write to file
      const filePath = path.join(outputPath, `tenant_${tenant.slug}_export.json`)
      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2))

      return filePath
    } catch (error) {
      throw new BadRequestException(`Failed to export tenant data: ${error.message}`)
    } finally {
      await queryRunner.release()
    }
  }

  async importTenantData(filePath: string, targetTenantId?: string): Promise<string> {
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException(`Import file not found: ${filePath}`)
    }

    const importData = JSON.parse(fs.readFileSync(filePath, "utf8"))
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Determine target tenant
      let tenant

      if (targetTenantId) {
        // Import to existing tenant
        tenant = await this.tenantService.findById(targetTenantId)
      } else {
        // Create new tenant based on import data
        const createDto = {
          name: `${importData.tenant.name} (Imported)`,
          slug: `${importData.tenant.slug}-imported`,
          description: `Imported from ${importData.tenant.name}`,
          settings: importData.tenant.config.settings,
        }

        tenant = await this.tenantService.create(createDto)
      }

      // Import data for each table
      for (const [table, records] of Object.entries(importData.data)) {
        for (const record of records as any[]) {
          // Replace original tenant ID with new tenant ID
          record.tenant_id = tenant.id

          // Remove primary key to allow auto-generation
          delete record.id

          // Insert the record
          const columns = Object.keys(record).join(", ")
          const values = Object.values(record)
            .map((v) => (typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : v))
            .join(", ")

          await queryRunner.query(`
            INSERT INTO ${table} (${columns})
            VALUES (${values})
          `)
        }
      }

      await queryRunner.commitTransaction()
      return tenant.id
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw new BadRequestException(`Failed to import tenant data: ${error.message}`)
    } finally {
      await queryRunner.release()
    }
  }

  private async getTablesWithTenantData(queryRunner: any): Promise<string[]> {
    const result = await queryRunner.query(`
      SELECT table_schema || '.' || table_name as table_name
      FROM information_schema.columns
      WHERE column_name = 'tenant_id'
      AND table_schema NOT IN ('pg_catalog', 'information_schema')
    `)

    return result.map((row) => row.table_name)
  }
}
