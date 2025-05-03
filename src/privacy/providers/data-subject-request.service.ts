@Injectable()
export class DataSubjectRequestService {
  constructor(
    @InjectRepository(DataSubjectRequestEntity)
    private dataSubjectRequestRepository: Repository<DataSubjectRequestEntity>,
    private dataInventoryService: DataInventoryService,
    private anonymizationService: AnonymizationService,
    private connection: Connection,
  ) {}

  async create(dto: CreateDataSubjectRequestDto): Promise<DataSubjectRequestEntity> {
    // Generate a reference number
    const requestReference = `DSR-${new Date().getTime().toString(36).toUpperCase()}`;
    
    // Set due date (30 days from now for GDPR compliance)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    
    // Create the request
    const request = this.dataSubjectRequestRepository.create({
      ...dto,
      requestReference,
      dueDate,
      status: DataSubjectRequestStatus.PENDING,
      actionHistory: [{
        timestamp: new Date(),
        action: 'Request created',
        performedBy: 'system',
      }],
    });
    
    return this.dataSubjectRequestRepository.save(request);
  }

  async findAll(): Promise<DataSubjectRequestEntity[]> {
    return this.dataSubjectRequestRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<DataSubjectRequestEntity> {
    return this.dataSubjectRequestRepository.findOne({ where: { id } });
  }

  async findByStatus(status: DataSubjectRequestStatus): Promise<DataSubjectRequestEntity[]> {
    return this.dataSubjectRequestRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async findBySubject(subjectId: string): Promise<DataSubjectRequestEntity[]> {
    return this.dataSubjectRequestRepository.find({
      where: { subjectId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: string, 
    status: DataSubjectRequestStatus, 
    performedBy: string,
    notes?: string
  ): Promise<DataSubjectRequestEntity> {
    const request = await this.findOne(id);
    if (!request) {
      throw new Error(`Request with id ${id} not found`);
    }
    
    // Add to action history
    const actionHistory = request.actionHistory || [];
    actionHistory.push({
      timestamp: new Date(),
      action: `Status updated to ${status}`,
      performedBy,
      notes,
    });
    
    // If completed, set completedAt
    const updates: any = { status, actionHistory };
    if (status === DataSubjectRequestStatus.COMPLETED) {
      updates.completedAt = new Date();
    }
    
    await this.dataSubjectRequestRepository.update(id, updates);
    return this.dataSubjectRequestRepository.findOne({ where: { id } });
  }

  async assignRequest(
    id: string,
    assignedTo: string,
    performedBy: string
  ): Promise<DataSubjectRequestEntity> {
    const request = await this.findOne(id);
    if (!request) {
      throw new Error(`Request with id ${id} not found`);
    }
    
    // Add to action history
    const actionHistory = request.actionHistory || [];
    actionHistory.push({
      timestamp: new Date(),
      action: `Request assigned to ${assignedTo}`,
      performedBy,
    });
    
    await this.dataSubjectRequestRepository.update(id, { assignedTo, actionHistory });
    return this.dataSubjectRequestRepository.findOne({ where: { id } });
  }

  async verifyIdentity(
    id: string,
    performedBy: string,
    notes?: string
  ): Promise<DataSubjectRequestEntity> {
    const request = await this.findOne(id);
    if (!request) {
      throw new Error(`Request with id ${id} not found`);
    }
    
    // Add to action history
    const actionHistory = request.actionHistory || [];
    actionHistory.push({
      timestamp: new Date(),
      action: 'Identity verified',
      performedBy,
      notes,
    });
    
    await this.dataSubjectRequestRepository.update(id, { 
      identityVerified: true, 
      actionHistory,
      status: DataSubjectRequestStatus.IN_PROGRESS 
    });
    
    return this.dataSubjectRequestRepository.findOne({ where: { id } });
  }

  async addActionToHistory(
    id: string,
    action: string,
    performedBy: string,
    notes?: string
  ): Promise<DataSubjectRequestEntity> {
    const request = await this.findOne(id);
    if (!request) {
      throw new Error(`Request with id ${id} not found`);
    }
    
    // Add to action history
    const actionHistory = request.actionHistory || [];
    actionHistory.push({
      timestamp: new Date(),
      action,
      performedBy,
      notes,
    });
    
    await this.dataSubjectRequestRepository.update(id, { actionHistory });
    return this.dataSubjectRequestRepository.findOne({ where: { id } });
  }

  // Process a data access request
  async processAccessRequest(id: string, performedBy: string): Promise<any> {
    const request = await this.findOne(id);
    if (!request) {
      throw new Error(`Request with id ${id} not found`);
    }
    
    if (!request.identityVerified) {
      throw new Error('Identity must be verified before processing access request');
    }
    
    // Get all entities with personal data
    const personalDataEntities = await this.dataInventoryService.getEntitiesWithPersonalData();
    
    // Prepare to collect data
    const subjectData = {};
    const queryRunner = this.connection.createQueryRunner();
    
    await queryRunner.connect();
    
    try {
      for (const entity of personalDataEntities) {
        // Get the personal data fields
        const personalFields = entity.fields
          .filter(field => field.personalData)
          .map(field => field.fieldName);
          
        if (personalFields.length === 0) {
          continue;
        }
        
        // Query the database for this subject's data
        const results = await queryRunner.manager.query(
          `SELECT id, ${personalFields.map(f => `"${f}"`).join(', ')} 
           FROM "${entity.tableName}" 
           WHERE CAST(id AS text) = $1 OR subject_id = $1 OR email = $1`,
          [request.subjectId]
        );
        
        if (results && results.length > 0) {
          subjectData[entity.entityName] = results;
        }
      }
      
      // Add this data collection action to history
      await this.addActionToHistory(
        id,
        'Collected personal data for access request',
        performedBy,
        `Found data in ${Object.keys(subjectData).length} entities`
      );
      
      // Update status if there's data found
      if (Object.keys(subjectData).length > 0) {
        await this.updateStatus(
          id,
          DataSubjectRequestStatus.IN_PROGRESS,
          performedBy,
          'Personal data collected, ready for review'
        );
      }
      
      return subjectData;
    } finally {
      await queryRunner.release();
    }
  }

  // Process an erasure request ("right to be forgotten")
  async processErasureRequest(id: string, performedBy: string): Promise<any> {
    const request = await this.findOne(id);
    if (!request) {
      throw new Error(`Request with id ${id} not found`);
    }
    
    if (!request.identityVerified) {
      throw new Error('Identity must be verified before processing erasure request');
    }
    
    // Get all entities with personal data
    const personalDataEntities = await this.dataInventoryService.getEntitiesWithPersonalData();
    
    // Track results
    const results = {
      entitiesProcessed: 0,
      recordsAnonymized: 0,
      recordsDeleted: 0,
    };
    
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      for (const entity of personalDataEntities) {
        // Get the personal data fields
        const personalFields = entity.fields
          .filter(field => field.personalData)
          .map(field => field.fieldName);
          
        if (personalFields.length === 0) {
          continue;
        }
        
        // Find the records for this subject
        const records = await queryRunner.manager.query(
          `SELECT id FROM "${entity.tableName}" 
           WHERE CAST(id AS text) = $1 OR subject_id = $1 OR email = $1`,
          [request.subjectId]
        );
        
        if (!records || records.length === 0) {
          continue;
        }
        
        results.entitiesProcessed++;
        
        // For each record, determine whether to delete or anonymize
        for (const record of records) {
          // Check if the entity has any required fields that can't be null
          // This is a simplified approach - in real implementation, check constraints
          const hasRequiredFields = entity.fields.some(f => 
            !f.personalData && f.fieldName !== 'id' && !f.fieldName.endsWith('_id')
          );
          
          if (hasRequiredFields) {
            // Anonymize the record
            await this.anonymizationService.anonymizeRecord(
              entity.entityName,
              record.id,
              personalFields,
              'pseudonymize', // Strategy
              performedBy,
              id // Related request ID
            );
            results.recordsAnonymized++;
          } else {
            // Delete the record
            await queryRunner.manager.query(
              `DELETE FROM "${entity.tableName}" WHERE id = $1`,
              [record.id]
            );
            results.recordsDeleted++;
          }
        }
      }
      
      // Add this action to history
      await this.addActionToHistory(
        id,
        'Processed erasure request',
        performedBy,
        `Processed ${results.entitiesProcessed} entities, anonymized ${results.recordsAnonymized} records, deleted ${results.recordsDeleted} records`
      );
      
      // Update status
      await this.updateStatus(
        id,
        DataSubjectRequestStatus.IN_PROGRESS,
        performedBy,
        'Erasure request processed, pending final verification'
      );
      
      await queryRunner.commitTransaction();
      return results;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Process a rectification (correction) request
  async processRectificationRequest(
    id: string, 
    corrections: Array<{ entityName: string; recordId: string; updates: Record<string, any> }>,
    performedBy: string
  ): Promise<any> {
    const request = await this.findOne(id);
    if (!request) {
      throw new Error(`Request with id ${id} not found`);
    }
    
    if (!request.identityVerified) {
      throw new Error('Identity must be verified before processing rectification request');
    }
    
    const results = {
      entitiesUpdated: 0,
      recordsUpdated: 0,
    };
    
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const processedEntities = new Set();
      
      for (const correction of corrections) {
        // Verify the entity exists
        const inventory = await this.dataInventoryService.findByEntityName(correction.entityName);
        if (!inventory) {
          throw new Error(`Entity ${correction.entityName} not found in data inventory`);
        }
        
        // Verify the record belongs to the requesting subject
        const record = await queryRunner.manager.query(
          `SELECT * FROM "${inventory.tableName}" WHERE id = $1`,
          [correction.recordId]
        );
        
        if (!record || record.length === 0) {
          throw new Error(`Record ${correction.recordId} not found in ${inventory.tableName}`);
        }
        
        // Ensure the record belongs to this subject
        // This is a simplified approach - in real implementation, more robust verification
        const subjectMatches = record[0].id === request.subjectId || 
                               record[0].subject_id === request.subjectId ||
                               record[0].email === request.subjectId;
                               
        if (!subjectMatches) {
          throw new Error(`Record ${correction.recordId} does not belong to the requesting subject`);
        }
        
        // Build the update query
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;
        
        for (const [key, value] of Object.entries(correction.updates)) {
          // Verify the field exists and is updatable
          const fieldExists = inventory.fields.some(f => f.fieldName === key);
          if (!fieldExists) {
            throw new Error(`Field ${key} does not exist in entity ${correction.entityName}`);
          }
          
          updateFields.push(`"${key}" = ${paramIndex}`);
          updateValues.push(value);
          paramIndex++;
        }
        
        if (updateFields.length === 0) {
          continue;
        }
        
        // Update the record
        await queryRunner.manager.query(
          `UPDATE "${inventory.tableName}" 
           SET ${updateFields.join(', ')} 
           WHERE id = ${paramIndex}`,
          [...updateValues, correction.recordId]
        );
        
        if (!processedEntities.has(correction.entityName)) {
          processedEntities.add(correction.entityName);
          results.entitiesUpdated++;
        }
        
        results.recordsUpdated++;
      }
      
      // Add this action to history
      await this.addActionToHistory(
        id,
        'Processed rectification request',
        performedBy,
        `Updated ${results.recordsUpdated} records across ${results.entitiesUpdated} entities`
      );
      
      // Update status
      await this.updateStatus(
        id,
        DataSubjectRequestStatus.IN_PROGRESS,
        performedBy,
        'Rectification request processed, pending final verification'
      );
      
      await queryRunner.commitTransaction();
      return results;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Complete a request (final step)
  async completeRequest(id: string, performedBy: string, notes?: string): Promise<DataSubjectRequestEntity> {
    return this.updateStatus(
      id,
      DataSubjectRequestStatus.COMPLETED,
      performedBy,
      notes || 'Request successfully completed'
    );
  }

  // Reject a request with reason
  async rejectRequest(id: string, performedBy: string, reason: string): Promise<DataSubjectRequestEntity> {
    return this.updateStatus(
      id,
      DataSubjectRequestStatus.REJECTED,
      performedBy,
      `Request rejected: ${reason}`
    );
  }

  // Get statistics on data subject requests
  async getRequestsStatistics(startDate?: Date, endDate?: Date): Promise<any> {
    const query = this.dataSubjectRequestRepository.createQueryBuilder('request');
    
    if (startDate) {
      query.andWhere('request.createdAt >= :startDate', { startDate });
    }
    
    if (endDate) {
      query.andWhere('request.createdAt <= :endDate', { endDate });
    }
    
    const [requests, total] = await query.getManyAndCount();
    
    const byStatus = {};
    const byType = {};
    let averageCompletionTimeInDays = 0;
    let completedCount = 0;
    
    for (const request of requests) {
      // Count by status
      byStatus[request.status] = (byStatus[request.status] || 0) + 1;
      
      // Count by type
      byType[request.requestType] = (byType[request.requestType] || 0) + 1;
      
      // Calculate completion time for completed requests
      if (request.status === DataSubjectRequestStatus.COMPLETED && request.completedAt) {
        const completionTime = request.completedAt.getTime() - request.createdAt.getTime();
        const completionDays = completionTime / (1000 * 60 * 60 * 24);
        averageCompletionTimeInDays += completionDays;
        completedCount++;
      }
    }
    
    if (completedCount > 0) {
      averageCompletionTimeInDays /= completedCount;
    }
    
    return {
      total,
      byStatus,
      byType,
      averageCompletionTimeInDays,
      overdue: requests.filter(r => 
        r.status !== DataSubjectRequestStatus.COMPLETED && 
        r.status !== DataSubjectRequestStatus.REJECTED &&
        r.dueDate < new Date()
      ).length,
      pendingVerification: requests.filter(r => !r.identityVerified).length,
    };
  }
}