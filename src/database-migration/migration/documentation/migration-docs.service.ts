import { Injectable, Logger } from "@nestjs/common"
import * as fs from "fs"
import * as path from "path"
import type { MigrationService } from "../migration.service"
import type { MigrationEntity } from "../entities/migration.entity"

export interface MigrationDocOptions {
  outputDir: string
  format: "markdown" | "html" | "json"
  includeCode: boolean
  includeHistory: boolean
  includeDiagrams: boolean
}

@Injectable()
export class MigrationDocsService {
  private readonly logger = new Logger(MigrationDocsService.name)

  constructor(private migrationService: MigrationService) {}

  async generateDocumentation(options: MigrationDocOptions): Promise<string> {
    this.logger.log(`Generating migration documentation in ${options.format} format`)

    // Ensure output directory exists
    if (!fs.existsSync(options.outputDir)) {
      fs.mkdirSync(options.outputDir, { recursive: true })
    }

    // Get all executed migrations
    const migrations = await this.migrationService.getExecutedMigrations()

    // Get migration history
    const history = options.includeHistory ? await this.migrationService.getMigrationHistory() : []

    // Generate documentation based on format
    let outputPath: string

    switch (options.format) {
      case "markdown":
        outputPath = await this.generateMarkdownDocs(options, migrations, history)
        break
      case "html":
        outputPath = await this.generateHtmlDocs(options, migrations, history)
        break
      case "json":
        outputPath = await this.generateJsonDocs(options, migrations, history)
        break
      default:
        throw new Error(`Unsupported documentation format: ${options.format}`)
    }

    this.logger.log(`Documentation generated at: ${outputPath}`)
    return outputPath
  }

  private async generateMarkdownDocs(
    options: MigrationDocOptions,
    migrations: MigrationEntity[],
    history: any[],
  ): Promise<string> {
    const outputPath = path.join(options.outputDir, "migrations.md")
    let content = `# Database Migration Documentation\n\n`
    content += `Generated on: ${new Date().toLocaleString()}\n\n`

    // Add overview section
    content += `## Overview\n\n`
    content += `Total migrations: ${migrations.length}\n\n`

    // Add migrations section
    content += `## Migrations\n\n`

    for (const migration of migrations) {
      content += `### ${migration.name}\n\n`
      content += `- **Status**: ${migration.status}\n`
      content += `- **Executed at**: ${new Date(migration.executedAt).toLocaleString()}\n`
      content += `- **Duration**: ${migration.duration}ms\n\n`

      if (options.includeCode) {
        try {
          const migrationFile = await this.loadMigrationFile(migration.name)
          content += `#### Migration Code\n\n`
          content += "```typescript\n"
          content += migrationFile.content
          content += "\n```\n\n"
        } catch (error) {
          content += `*Migration code not available*\n\n`
        }
      }
    }

    // Add history section if requested
    if (options.includeHistory && history.length > 0) {
      content += `## Migration History\n\n`

      for (const entry of history) {
        content += `- **${entry.operation}** ${entry.migrationName} at ${new Date(entry.timestamp).toLocaleString()}\n`
        if (entry.errorMessage) {
          content += `  - Error: ${entry.errorMessage}\n`
        }
      }
      content += "\n"
    }

    // Add migration patterns section
    content += `## Migration Patterns\n\n`
    content += `### Zero-Downtime Migration Pattern\n\n`
    content += `1. Deploy new code that works with both old and new schema\n`
    content += `2. Apply schema changes in a backward-compatible way\n`
    content += `3. Deploy code that works with new schema only\n`
    content += `4. Clean up transitional elements\n\n`

    content += `### Large Table Migration Pattern\n\n`
    content += `1. Create new table with desired schema\n`
    content += `2. Set up dual-write mechanism to both tables\n`
    content += `3. Migrate existing data in batches\n`
    content += `4. Verify data consistency\n`
    content += `5. Switch reads to new table\n`
    content += `6. Remove old table\n\n`

    // Add diagrams if requested
    if (options.includeDiagrams) {
      content += `## Migration Flow Diagrams\n\n`
      content += `### Standard Migration Flow\n\n`
      content += "```mermaid\n"
      content += "graph TD\n"
      content += "  A[Start Migration] --> B[Acquire Lock]\n"
      content += "  B --> C[Run Migration Up]\n"
      content += "  C --> D{Success?}\n"
      content += "  D -->|Yes| E[Record Success]\n"
      content += "  D -->|No| F[Run Migration Down]\n"
      content += "  F --> G[Record Failure]\n"
      content += "  E --> H[Release Lock]\n"
      content += "  G --> H\n"
      content += "  H --> I[End Migration]\n"
      content += "```\n\n"

      content += `### Zero-Downtime Migration Flow\n\n`
      content += "```mermaid\n"
      content += "graph TD\n"
      content += "  A[Deploy Code v1+v2] --> B[Start Migration]\n"
      content += "  B --> C[Add New Schema Elements]\n"
      content += "  C --> D[Populate New Schema]\n"
      content += "  D --> E[Verify Consistency]\n"
      content += "  E --> F[Deploy Code v2]\n"
      content += "  F --> G[Clean Up Old Schema]\n"
      content += "```\n\n"
    }

    fs.writeFileSync(outputPath, content)
    return outputPath
  }

  private async generateHtmlDocs(
    options: MigrationDocOptions,
    migrations: MigrationEntity[],
    history: any[],
  ): Promise<string> {
    const outputPath = path.join(options.outputDir, "migrations.html")
    let content = `<!DOCTYPE html>
<html>
<head>
  <title>Database Migration Documentation</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    h2 { color: #555; margin-top: 30px; }
    h3 { color: #777; }
    pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
    .migration { border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
    .status-COMPLETED { color: green; }
    .status-FAILED { color: red; }
    .status-ROLLED_BACK { color: orange; }
  </style>
</head>
<body>
  <h1>Database Migration Documentation</h1>
  <p>Generated on: ${new Date().toLocaleString()}</p>
  
  <h2>Overview</h2>
  <p>Total migrations: ${migrations.length}</p>
  
  <h2>Migrations</h2>`

    for (const migration of migrations) {
      content += `
  <div class="migration">
    <h3>${migration.name}</h3>
    <p><strong>Status:</strong> <span class="status-${migration.status}">${migration.status}</span></p>
    <p><strong>Executed at:</strong> ${new Date(migration.executedAt).toLocaleString()}</p>
    <p><strong>Duration:</strong> ${migration.duration}ms</p>`

      if (options.includeCode) {
        try {
          const migrationFile = await this.loadMigrationFile(migration.name)
          content += `
    <h4>Migration Code</h4>
    <pre><code>${this.escapeHtml(migrationFile.content)}</code></pre>`
        } catch (error) {
          content += `
    <p><em>Migration code not available</em></p>`
        }
      }

      content += `
  </div>`
    }

    // Add history section if requested
    if (options.includeHistory && history.length > 0) {
      content += `
  <h2>Migration History</h2>
  <ul>`

      for (const entry of history) {
        content += `
    <li>
      <strong>${entry.operation}</strong> ${entry.migrationName} at ${new Date(entry.timestamp).toLocaleString()}
      ${entry.errorMessage ? `<br><em>Error: ${this.escapeHtml(entry.errorMessage)}</em>` : ""}
    </li>`
      }

      content += `
  </ul>`
    }

    // Add migration patterns section
    content += `
  <h2>Migration Patterns</h2>
  
  <h3>Zero-Downtime Migration Pattern</h3>
  <ol>
    <li>Deploy new code that works with both old and new schema</li>
    <li>Apply schema changes in a backward-compatible way</li>
    <li>Deploy code that works with new schema only</li>
    <li>Clean up transitional elements</li>
  </ol>
  
  <h3>Large Table Migration Pattern</h3>
  <ol>
    <li>Create new table with desired schema</li>
    <li>Set up dual-write mechanism to both tables</li>
    <li>Migrate existing data in batches</li>
    <li>Verify data consistency</li>
    <li>Switch reads to new table</li>
    <li>Remove old table</li>
  </ol>`

    content += `
</body>
</html>`

    fs.writeFileSync(outputPath, content)
    return outputPath
  }

  private async generateJsonDocs(
    options: MigrationDocOptions,
    migrations: MigrationEntity[],
    history: any[],
  ): Promise<string> {
    const outputPath = path.join(options.outputDir, "migrations.json")

    const migrationDocs = await Promise.all(
      migrations.map(async (migration) => {
        const doc: any = {
          name: migration.name,
          status: migration.status,
          executedAt: migration.executedAt,
          duration: migration.duration,
        }

        if (options.includeCode) {
          try {
            const migrationFile = await this.loadMigrationFile(migration.name)
            doc.code = migrationFile.content
          } catch (error) {
            doc.code = null
          }
        }

        return doc
      }),
    )

    const docs = {
      generatedAt: new Date(),
      overview: {
        totalMigrations: migrations.length,
      },
      migrations: migrationDocs,
      history: options.includeHistory ? history : undefined,
      patterns: {
        zeroDowntime: [
          "Deploy new code that works with both old and new schema",
          "Apply schema changes in a backward-compatible way",
          "Deploy code that works with new schema only",
          "Clean up transitional elements",
        ],
        largeTable: [
          "Create new table with desired schema",
          "Set up dual-write mechanism to both tables",
          "Migrate existing data in batches",
          "Verify data consistency",
          "Switch reads to new table",
          "Remove old table",
        ],
      },
    }

    fs.writeFileSync(outputPath, JSON.stringify(docs, null, 2))
    return outputPath
  }

  private async loadMigrationFile(migrationName: string): Promise<{ content: string }> {
    // This would normally load the migration file from the migrations directory
    // For this example, we'll return a placeholder
    return {
      content: `// Migration: ${migrationName}\n\nexport const up = async (queryRunner) => {\n  // Migration code\n};\n\nexport const down = async (queryRunner) => {\n  // Rollback code\n};`,
    }
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }
}
