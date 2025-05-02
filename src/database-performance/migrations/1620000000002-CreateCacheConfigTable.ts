import { type MigrationInterface, type QueryRunner, Table, TableIndex } from "typeorm"

export class CreateCacheConfigTable1620000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "cache_config",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "query_pattern",
            type: "text",
          },
          {
            name: "ttl_seconds",
            type: "integer",
          },
          {
            name: "is_enabled",
            type: "boolean",
            default: true,
          },
          {
            name: "hit_count",
            type: "integer",
            default: 0,
          },
          {
            name: "miss_count",
            type: "integer",
            default: 0,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    )

    await queryRunner.createIndex(
      "cache_config",
      new TableIndex({
        name: "IDX_CACHE_CONFIG_QUERY_PATTERN",
        columnNames: ["query_pattern"],
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("cache_config")
  }
}
