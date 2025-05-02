import { Connection } from 'typeorm';

@Injectable()
export class AnonymizationService {
  constructor(
    private connection: Connection,
    @InjectRepository(AnonymizationLogEntity)
    private anonymizationLogRepository: Repository<AnonymizationLogEntity>,
    private dataInventoryService: DataInventoryService,
  ) {}

  private anonymizationStrategies = {
    nullify: (value: any) => null,
    truncate: (value: string) => '',
    hash: (value: string) => this.hashValue(value),
    randomize: (value: any, type: string) => this.generateRandomValue(type),
    pseudonymize: (value: string) => this.generatePseudonym(value),
    mask: (value: string) => this.maskValue(value),
    generalize: (value: any, options: any) => this.generalizeValue(value, options),
  };

  private hashValue(value: string): string {
    // This is a placeholder - use a proper hashing library in production
    return `hashed_${value}`;
  }

  private generateRandomValue(type: string): any {
    // Generate random values based on data type
    switch (type) {
      case 'string':
        return Math.random().toString(36).substring(2, 15);
      case 'number':
        return Math.floor(Math.random() * 1000);
      case 'boolean':
        return Math.random() > 0.5;
      case 'date':
        return new Date(Math.random() * 1000000000000);
      default:
        return null;
    }
  }

  private generatePseudonym(value: string): string {
    // In a real implementation, this would maintain consistent pseudonyms
    // Here we're just showing a basic example
    return `pseudonym_${Math.random().toString(36).substring(2, 10)}`;
  }

  private maskValue(value: string): string {
    if (!value) return value;
    // Keep first and last character, mask the rest
    return value.charAt(0) + 'X'.repeat(Math.max(0, value.length - 2)) + value.charAt(value.length - 1);
  }

  private generalizeValue(value: any, options: any): any {
    // Implement generalization strategies (like age ranges instead of exact ages)
    if (typeof value === 'number' && options.ranges) {
      for (const range of options.ranges) {
        if (value >= range.min && value <= range.max) {
          return `${range.min}-${range.max}`;
        }
      }
    }
    return value;
  }

  async anonymizeRecord(
    entityName: string,
    recordId: string,
    fieldsToAnonymize: string[],
    strategy: string,
    performedBy: string,
    relatedToRequest?: string,
  ): Promise<void> {
    // Get the data inventory to know table name and field details
    const inventory = await this.dataInventoryService.findByEntityName(entityName);
    if (!inventory) {
      throw new Error(`Entity ${entityName} not found in data inventory`);
    }

    const tableName = inventory.tableName;
    const queryRunner = this.connection.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // For each field to anonymize
      for (const fieldName of fieldsToAnonymize) {
        // Find the field in inventory to get metadata
        const fieldMeta = inventory.fields.find(f => f.fieldName === fieldName);
        if (!fieldMeta) {
          throw new Error(`Field ${fieldName} not found in entity ${entityName}`);
        }

        // Get the current value to determine data type
        const record = await queryRunner.manager.query(
          `SELECT "${fieldName}" FROM "${tableName}" WHERE id = $1`,
          [recordId]
        );

        if (!record || record.length === 0) {
          throw new Error(`Record with id ${recordId} not found in ${tableName}`);
        }

        const currentValue = record[0][fieldName];
        const dataType = typeof currentValue;

        // Determine which anonymization strategy to use
        const anonymizationMethod = fieldMeta.anonymizationStrategy || strategy;
        const anonymizationFn = this.anonymizationStrategies[anonymizationMethod];

        if (!anonymizationFn) {
          throw new Error(`Anonymization strategy ${anonymizationMethod} not supported`);
        }

        // Apply the anonymization
        const anonymizedValue = anonymizationFn(currentValue, dataType);

        // Update the record with anonymized value
        await queryRunner.manager.query(
          `UPDATE "${tableName}" SET "${fieldName}" = $1 WHERE id = $2`,
          [anonymizedValue, recordId]
        );
      }

      // Log the anonymization action
      const logEntry = this.anonymizationLogRepository.create({
        entityName,
        recordId,
        fieldsAnonymized: fieldsToAnonymize,
        anonymizationStrategy: strategy,
        relatedToRequest,
        performedBy,
      });
      
      await this.anonymizationLogRepository.save(logEntry);
      
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async bulkAnonymize(
    entityName: string,
    condition: string,
    fieldsToAnonymize: string[],
    strategy: string,
    performedBy: string,
  ): Promise<number> {
    // Get the data inventory
    const inventory = await this.dataInventoryService.findByEntityName(entityName);
    if (!inventory) {
      throw new Error(`Entity ${entityName} not found in data inventory`);
    }

    const tableName = inventory.tableName;
    const queryRunner = this.connection.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // First get all record IDs that match the condition
      const recordsToAnonymize = await queryRunner.manager.query(
        `SELECT id FROM "${tableName}" WHERE ${condition}`
      );
      
      if (!recordsToAnonymize || recordsToAnonymize.length === 0) {
        return 0;
      }
      
      // Create anonymization logs for each record
      const logs = recordsToAnonymize.map(record => ({
        entityName,
        recordId: record.id,
        fieldsAnonymized: fieldsToAnonymize,
        anonymizationStrategy: strategy,
        performedBy,
      }));
      
      // For each field to anonymize
      for (const fieldName of fieldsToAnonymize) {
        // Find the field in inventory
        const fieldMeta = inventory.fields.find(f => f.fieldName === fieldName);
        if (!fieldMeta) {
          throw new Error(`Field ${fieldName} not found in entity ${entityName}`);
        }

        // Determine which anonymization strategy to use
        const anonymizationMethod = fieldMeta.anonymizationStrategy || strategy;
        
        // Apply anonymization based on strategy
        if (anonymizationMethod === 'nullify') {
          await queryRunner.manager.query(
            `UPDATE "${tableName}" SET "${fieldName}" = NULL WHERE ${condition}`
          );
        } else if (anonymizationMethod === 'truncate') {
          await queryRunner.manager.query(
            `UPDATE "${tableName}" SET "${fieldName}" = '' WHERE ${condition}`
          );
        } else {
          // For other strategies, we need to process records individually
          for (const record of recordsToAnonymize) {
            await this.anonymizeRecord(
              entityName,
              record.id,
              [fieldName],
              anonymizationMethod,
              performedBy
            );
          }
        }
      }
      
      // Save all logs
      await this.anonymizationLogRepository.save(logs);
      
      await queryRunner.commitTransaction();
      return recordsToAnonymize.length;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getLogs(entityName?: string, recordId?: string): Promise<AnonymizationLogEntity[]> {
    const query: any = {};
    
    if (entityName) {
      query.entityName = entityName;
    }
    
    if (recordId) {
      query.recordId = recordId;
    }
    
    return this.anonymizationLogRepository.find({ 
      where: query,
      order: { performedAt: 'DESC' } 
    });
  }
}
