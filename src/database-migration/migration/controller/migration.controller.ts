import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from "@nestjs/common"
import type { MigrationService } from "../migration.service"
import type { MigrationRollbackService } from "../rollback/migration-rollback.service"
import type { MigrationGenerator } from "../generators/migration-generator.service"
import type { MigrationPerformanceService } from "../performance/migration-performance.service"
import type { CiCdIntegrationService } from "../ci-cd/ci-cd-integration.service"
import type { ABTestingService } from "../a-b-testing/a-b-testing.service"
import type { MigrationDocsService } from "../documentation/migration-docs.service"

@Controller("migrations")
export class MigrationController {
  constructor(
    private migrationService: MigrationService,
    private rollbackService: MigrationRollbackService,
    private generatorService: MigrationGenerator,
    private performanceService: MigrationPerformanceService,
    private ciCdService: CiCdIntegrationService,
    private abTestingService: ABTestingService,
    private docsService: MigrationDocsService,
  ) {}

  @Get()
  async getAllMigrations() {
    try {
      const migrations = await this.migrationService.getExecutedMigrations()
      return { migrations }
    } catch (error) {
      throw new HttpException(`Failed to get migrations: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get("history")
  async getMigrationHistory() {
    try {
      const history = await this.migrationService.getMigrationHistory()
      return { history }
    } catch (error) {
      throw new HttpException(`Failed to get migration history: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Post('apply')
  async applyMigrations(
    @Body() body: { dryRun?: boolean; single?: string; verifyOnly?: boolean }
  ) {
    try {
      await this.migrationService.applyMigrations(
        {
        dryRun: body.dryRun,
        single: body.single,
        verifyOnly: body.verifyOnly,
      });
      return { success: true, message: 'Migrations applied successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to apply migrations: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('rollback')
  async rollbackMigration(@Body() body: { migration?: string; batch?: boolean }) {
    try {
      if (body.migration) {
        await this.rollbackService.rollbackMigration(body.migration);
      } else if (body.batch) {
        await this.rollbackService.rollbackLastBatch();
      } else {
        await this.migrationService.rollbackLastMigration();
      }
      return { success: true, message: 'Rollback completed successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to rollback migration: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('generate')
  async generateMigration(
    @Body() body: {
      name: string;
      type?: 'standard' | 'zero-downtime';
      empty?: boolean;
      dataTable?: string;
      indexTable?: string;
      indexColumns?: string[];
    }
  ) {
    try {
      let filePath: string;
      
      if (body.dataTable) {
        filePath = await this.generatorService.generateDataMigration(body.dataTable, {
          batchSize: 1000,
        });
      } else if (body.indexTable && body.indexColumns) {
        filePath = await this.generatorService.generateIndexMigration(
          body.indexTable,
          body.indexColumns
        );
      } else {
        filePath = await this.generatorService.generateMigration({
          name: body.name,
          empty: body.empty,
          addTimestamp: true,
          type: body.type || 'standard',
        });
      }
      
      return { 
        success: true, 
        message: 'Migration generated successfully',
        filePath 
      };
    } catch (error) {
      throw new HttpException(
        `Failed to generate migration: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("performance")
  async getPerformanceSnapshot() {
    try {
      const snapshot = await this.performanceService.capturePerformanceSnapshot()
      return { snapshot }
    } catch (error) {
      throw new HttpException(
        `Failed to capture performance snapshot: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Post('ci-cd/run')
  async runCiCdPipeline(
    @Body() body: {
      environment: 'development' | 'staging' | 'production';
      autoApprove?: boolean;
      performanceThreshold?: number;
      notificationEndpoint?: string;
      dryRun?: boolean;
    }
  ) {
    try {
      const result = await this.ciCdService.runPipelineMigration({
        environment: body.environment,
        autoApprove: body.autoApprove || false,
        performanceThreshold: body.performanceThreshold || 20,
        notificationEndpoint: body.notificationEndpoint,
        dryRun: body.dryRun,
      });
      
      return { 
        success: result, 
        message: result 
          ? 'CI/CD pipeline migration completed successfully' 
          : 'CI/CD pipeline migration failed or requires approval'
      };
    } catch (error) {
      throw new HttpException(
        `Failed to run CI/CD pipeline: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('ab-test/setup')
  async setupABTest(@Body() config: any) {
    try {
      await this.abTestingService.setupABTest(config);
      return { 
        success: true, 
        message: `A/B test ${config.name} set up successfully` 
      };
    } catch (error) {
      throw new HttpException(
        `Failed to set up A/B test: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('ab-test/:name/results')
  async getABTestResults(@Param('name') testName: string) {
    try {
      const results = await this.abTestingService.analyzeABTestResults(testName);
      return { results };
    } catch (error) {
      throw new HttpException(
        `Failed to get A/B test results: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("ab-test/:name/finalize")
  async finalizeABTest(@Param('name') testName: string, @Body() body: { winner: 'control' | 'experiment' }) {
    try {
      await this.abTestingService.finalizeABTest(testName, body.winner)
      return {
        success: true,
        message: `A/B test ${testName} finalized with ${body.winner} as the winner`,
      }
    } catch (error) {
      throw new HttpException(`Failed to finalize A/B test: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Post('docs/generate')
  async generateDocs(
    @Body() options: {
      outputDir: string;
      format: 'markdown' | 'html' | 'json';
      includeCode?: boolean;
      includeHistory?: boolean;
      includeDiagrams?: boolean;
    }
  ) {
    try {
      const outputPath = await this.docsService.generateDocumentation({
        outputDir: options.outputDir,
        format: options.format,
        includeCode: options.includeCode || false,
        includeHistory: options.includeHistory || true,
        includeDiagrams: options.includeDiagrams || true,
      });
      
      return { 
        success: true, 
        message: 'Documentation generated successfully',
        outputPath 
      };
    } catch (error) {
      throw new HttpException(
        `Failed to generate documentation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
