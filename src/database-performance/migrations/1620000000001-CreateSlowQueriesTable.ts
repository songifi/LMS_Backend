import { type MigrationInterface, type QueryRunner, Table, TableIndex } from "typeorm"

export class CreateSlowQueriesTable1620000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "slow_query",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "query_text",
            type: "text",
          },
          {
            name: "execution_time_ms",
            type: "integer",
          },
          {
            name: "explain_plan",
            type: "text",
            isNullable: true,
          },
          {
            name: "suggested_indexes",
            type: "text",
            isNullable: true,
          },
          {
            name: "table_name",
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
      "slow_query",
      new TableIndex({
        name: "IDX_SLOW_QUERY_EXECUTION_TIME",
        columnNames: ["execution_time_ms"],
      }),
    )

    await queryRunner.createIndex(
      "slow_query",
      new TableIndex({
        name: "IDX_SLOW_QUERY_CREATED_AT",
        columnNames: ["created_at"],
      }),
    )

    await queryRunner.createIndex(
      "slow_query",
      new TableIndex({
        name: "IDX_SLOW_QUERY_TABLE_NAME",
        columnNames: ["table_name"],
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("slow_query")
  }
}
