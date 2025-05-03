import { type MigrationInterface, type QueryRunner, Table, TableIndex } from "typeorm"

export class CreatePerformanceMetricsTable1620000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "performance_metric",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "query_name",
            type: "varchar",
          },
          {
            name: "execution_time_ms",
            type: "integer",
          },
          {
            name: "query_text",
            type: "text",
            isNullable: true,
          },
          {
            name: "concurrent_users",
            type: "integer",
          },
          {
            name: "is_cached",
            type: "boolean",
            default: false,
          },
          {
            name: "indexes_used",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "table_name",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "operation_type",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    )

    await queryRunner.createIndex(
      "performance_metric",
      new TableIndex({
        name: "IDX_PERFORMANCE_METRIC_QUERY_NAME",
        columnNames: ["query_name"],
      }),
    )

    await queryRunner.createIndex(
      "performance_metric",
      new TableIndex({
        name: "IDX_PERFORMANCE_METRIC_CREATED_AT",
        columnNames: ["created_at"],
      }),
    )

    await queryRunner.createIndex(
      "performance_metric",
      new TableIndex({
        name: "IDX_PERFORMANCE_METRIC_TABLE_NAME",
        columnNames: ["table_name"],
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("performance_metric")
  }
}
