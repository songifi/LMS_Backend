import { Injectable } from "@nestjs/common"
import { Connection, QueryRunner } from "typeorm"

/**
 * Utility service for managing database transactions
 */
@Injectable()
export class TransactionManager {
  constructor(private connection: Connection) {}

  /**
   * Executes a function within a transaction
   * @param callback Function to execute within the transaction
   * @returns Result of the callback function
   */
  async executeTransaction<T>(callback: (queryRunner: QueryRunner) => Promise<T>): Promise<T> {
    const queryRunner = this.connection.createQueryRunner()

    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const result = await callback(queryRunner)
      await queryRunner.commitTransaction()
      return result
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
