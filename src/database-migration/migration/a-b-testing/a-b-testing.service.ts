import { Injectable, Logger } from "@nestjs/common"
import type { Connection, QueryRunner } from "typeorm"
import type { MigrationPerformanceService, PerformanceSnapshot } from "../performance/migration-performance.service"
import type { PostgresSpecificMigrationService } from "../database-specific/postgres-migration.service"

export interface ABTestConfig {
  name: string
  description: string
  startDate: Date
  endDate: Date
  controlGroup: {
    percentage: number // 0-100
    schema: string
  }
  experimentGroup: {
    percentage: number // 0-100
    schema: string
  }
  metrics: string[] // Metrics to track
}

export interface ABTestResult {
  testName: string
  startDate: Date
  endDate: Date
  controlPerformance: PerformanceSnapshot
  experimentPerformance: PerformanceSnapshot
  performanceDifference: {
    queryPerformance: Record<string, number> // percentage difference
    tableGrowth: Record<string, number> // percentage difference
    overallScore: number // positive means experiment is better
  }
  winner: "control" | "experiment" | "tie"
  recommendations: string[]
}

@Injectable()
export class ABTestingService {
  private readonly logger = new Logger(ABTestingService.name)
  private activeTests: Map<string, ABTestConfig> = new Map()

  constructor(
    private connection: Connection,
    private performanceService: MigrationPerformanceService,
    private postgresService: PostgresSpecificMigrationService,
  ) {}

  async setupABTest(config: ABTestConfig): Promise<void> {
    this.logger.log(`Setting up A/B test: ${config.name}`)

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Create schemas if they don't exist
      await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS ${config.controlGroup.schema}`)
      await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS ${config.experimentGroup.schema}`)

      // Create routing function that will direct traffic based on session/user ID
      await this.createRoutingFunction(queryRunner, config)

      // Store the active test configuration
      this.activeTests.set(config.name, config)

      await queryRunner.commitTransaction()
      this.logger.log(`A/B test ${config.name} setup completed`)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      this.logger.error(`Failed to setup A/B test ${config.name}`, error.stack)
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  private async createRoutingFunction(queryRunner: QueryRunner, config: ABTestConfig): Promise<void> {
    // Create a function that determines which schema to use based on user/session ID
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION ${config.name}_route_request(user_id text)
      RETURNS text AS $$
      DECLARE
        hash_value float;
        routing_value float;
      BEGIN
        -- Generate a consistent hash value between 0 and 100 for the user ID
        hash_value := abs(('x' || substr(md5(user_id), 1, 16))::bit(64)::bigint) % 100;
        
        -- Route based on configured percentages
        IF hash_value < ${config.controlGroup.percentage} THEN
          RETURN '${config.controlGroup.schema}';
        ELSE
          RETURN '${config.experimentGroup.schema}';
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Create a view that logs which schema was used for each request
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ab_test_logs (
        id SERIAL PRIMARY KEY,
        test_name text NOT NULL,
        user_id text NOT NULL,
        schema_used text NOT NULL,
        request_time timestamp NOT NULL DEFAULT NOW(),
        metrics jsonb
      );
    `)

    // Create a function to log metrics for the A/B test
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION ${config.name}_log_metrics(
        p_user_id text,
        p_schema text,
        p_metrics jsonb
      )
      RETURNS void AS $$
      BEGIN
        INSERT INTO ab_test_logs (test_name, user_id, schema_used, metrics)
        VALUES ('${config.name}', p_user_id, p_schema, p_metrics);
      END;
      $$ LANGUAGE plpgsql;
    `)
  }

  async logABTestMetrics(testName: string, userId: string, metrics: Record<string, any>): Promise<void> {
    const test = this.activeTests.get(testName)
    if (!test) {
      throw new Error(`A/B test ${testName} not found`)
    }

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()

    try {
      // Determine which schema was used for this user
      const result = await queryRunner.query(`SELECT ${testName}_route_request($1) as schema`, [userId])

      const schemaUsed = result[0].schema

      // Log the metrics
      await queryRunner.query(`SELECT ${testName}_log_metrics($1, $2, $3)`, [
        userId,
        schemaUsed,
        JSON.stringify(metrics),
      ])
    } finally {
      await queryRunner.release()
    }
  }

  async analyzeABTestResults(testName: string): Promise<ABTestResult> {
    const test = this.activeTests.get(testName)
    if (!test) {
      throw new Error(`A/B test ${testName} not found`)
    }

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()

    try {
      // Get performance metrics for control group
      const controlPerformance = await this.captureSchemaPerformance(queryRunner, test.controlGroup.schema)

      // Get performance metrics for experiment group
      const experimentPerformance = await this.captureSchemaPerformance(queryRunner, test.experimentGroup.schema)

      // Compare performance metrics
      const performanceDifference = this.comparePerformance(controlPerformance, experimentPerformance)

      // Determine winner
      let winner: "control" | "experiment" | "tie"
      if (performanceDifference.overallScore > 10) {
        winner = "experiment"
      } else if (performanceDifference.overallScore < -10) {
        winner = "control"
      } else {
        winner = "tie"
      }

      // Generate recommendations
      const recommendations = this.generateRecommendations(test, performanceDifference, winner)

      return {
        testName,
        startDate: test.startDate,
        endDate: test.endDate,
        controlPerformance,
        experimentPerformance,
        performanceDifference,
        winner,
        recommendations,
      }
    } finally {
      await queryRunner.release()
    }
  }

  private async captureSchemaPerformance(queryRunner: QueryRunner, schema: string): Promise<PerformanceSnapshot> {
    // This is a simplified version - in reality, we would capture
    // performance metrics specific to the schema
    return this.performanceService.capturePerformanceSnapshot()
  }

  private comparePerformance(control: PerformanceSnapshot, experiment: PerformanceSnapshot): any {
    // Compare query performance
    const queryPerformance: Record<string, number> = {}

    experiment.queryStats.forEach((expQuery) => {
      const controlQuery = control.queryStats.find((q) => q.queryPattern === expQuery.queryPattern)

      if (controlQuery) {
        // Calculate percentage difference (negative means experiment is faster)
        const diff =
          ((expQuery.avgExecutionTimeMs - controlQuery.avgExecutionTimeMs) / controlQuery.avgExecutionTimeMs) * 100

        queryPerformance[expQuery.queryPattern] = diff
      }
    })

    // Compare table growth
    const tableGrowth: Record<string, number> = {}

    Object.keys(experiment.tableStats).forEach((tableName) => {
      if (control.tableStats[tableName]) {
        const controlSize = control.tableStats[tableName].sizeBytes
        const expSize = experiment.tableStats[tableName].sizeBytes

        // Calculate percentage difference
        tableGrowth[tableName] = ((expSize - controlSize) / controlSize) * 100
      }
    })

    // Calculate overall score (negative means control is better)
    const queryScores = Object.values(queryPerformance)
    const avgQueryScore =
      queryScores.length > 0 ? -1 * (queryScores.reduce((sum, val) => sum + val, 0) / queryScores.length) : 0

    const tableScores = Object.values(tableGrowth)
    const avgTableScore =
      tableScores.length > 0 ? -1 * (tableScores.reduce((sum, val) => sum + val, 0) / tableScores.length) : 0

    // Weight query performance higher than table growth
    const overallScore = avgQueryScore * 0.7 + avgTableScore * 0.3

    return {
      queryPerformance,
      tableGrowth,
      overallScore,
    }
  }

  private generateRecommendations(
    test: ABTestConfig,
    performanceDifference: any,
    winner: "control" | "experiment" | "tie",
  ): string[] {
    const recommendations: string[] = []

    if (winner === "experiment") {
      recommendations.push(
        `The experiment schema (${test.experimentGroup.schema}) outperformed the control schema by ${performanceDifference.overallScore.toFixed(2)}%. Consider adopting these changes.`,
      )
    } else if (winner === "control") {
      recommendations.push(
        `The control schema (${test.controlGroup.schema}) outperformed the experiment schema by ${Math.abs(performanceDifference.overallScore).toFixed(2)}%. Consider keeping the current schema.`,
      )
    } else {
      recommendations.push(
        `No significant performance difference was detected between schemas. Consider other factors for decision making.`,
      )
    }

    // Add specific recommendations based on performance metrics
    const slowQueries = Object.entries(performanceDifference.queryPerformance)
      .filter(([_, diff]) => (diff as number) > 20)
      .map(([pattern, _]) => pattern)

    if (slowQueries.length > 0) {
      recommendations.push(
        `The following queries performed significantly worse in the ${winner === "control" ? "experiment" : "control"} schema: ${slowQueries.join(", ")}`,
      )
    }

    const largeGrowth = Object.entries(performanceDifference.tableGrowth)
      .filter(([_, diff]) => (diff as number) > 20)
      .map(([table, _]) => table)

    if (largeGrowth.length > 0) {
      recommendations.push(
        `The following tables grew significantly more in the experiment schema: ${largeGrowth.join(", ")}`,
      )
    }

    return recommendations
  }

  async finalizeABTest(testName: string, winner: "control" | "experiment"): Promise<void> {
    const test = this.activeTests.get(testName)
    if (!test) {
      throw new Error(`A/B test ${testName} not found`)
    }

    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Determine which schema to keep and which to drop
      const keepSchema = winner === "control" ? test.controlGroup.schema : test.experimentGroup.schema

      const dropSchema = winner === "control" ? test.experimentGroup.schema : test.controlGroup.schema

      // Copy all objects from the winning schema to public
      await this.migrateSchemaToPublic(queryRunner, keepSchema)

      // Drop both test schemas
      await queryRunner.query(`DROP SCHEMA IF EXISTS ${keepSchema} CASCADE`)
      await queryRunner.query(`DROP SCHEMA IF EXISTS ${dropSchema} CASCADE`)

      // Drop routing functions
      await queryRunner.query(`DROP FUNCTION IF EXISTS ${testName}_route_request(text)`)
      await queryRunner.query(`DROP FUNCTION IF EXISTS ${testName}_log_metrics(text, text, jsonb)`)

      // Remove test from active tests
      this.activeTests.delete(testName)

      await queryRunner.commitTransaction()
      this.logger.log(`A/B test ${testName} finalized with ${winner} as the winner`)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      this.logger.error(`Failed to finalize A/B test ${testName}`, error.stack)
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  private async migrateSchemaToPublic(queryRunner: QueryRunner, schema: string): Promise<void> {
    // Get all tables in the schema
    const tables = await queryRunner.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = '${schema}'
    `)

    // Copy each table to public schema
    for (const table of tables) {
      const tableName = table.tablename

      // Check if table exists in public schema
      const tableExists = await this.postgresService.tableExists(queryRunner, tableName)

      if (tableExists) {
        // If table exists, copy data
        await queryRunner.query(`
          INSERT INTO public."${tableName}"
          SELECT * FROM ${schema}."${tableName}"
          ON CONFLICT DO NOTHING
        `)
      } else {
        // If table doesn't exist, create it
        await queryRunner.query(`
          CREATE TABLE public."${tableName}" (LIKE ${schema}."${tableName}" INCLUDING ALL);
          INSERT INTO public."${tableName}"
          SELECT * FROM ${schema}."${tableName}";
        `)
      }
    }

    // Copy other objects (views, functions, etc.)
    // This would require more complex logic to handle dependencies correctly
  }
}
