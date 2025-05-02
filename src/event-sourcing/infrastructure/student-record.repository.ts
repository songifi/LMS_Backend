import { Injectable, Logger } from '@nestjs/common';
import { DomainEvent } from '../../domain/events/base.event';
import { StudentRecord } from '../../domain/student-record.aggregate';
import { EventStore } from '../../infrastructure/event-store.interface';
import { ProjectionManager } from '../../infrastructure/projection/projection-manager.service';
import { Snapshot, SnapshotStore } from '../../infrastructure/snapshot/snapshot.interface';

const SNAPSHOT_FREQUENCY = 10; // Create snapshot every 10 events

@Injectable()
export class StudentRecordRepository {
  private readonly logger = new Logger(StudentRecordRepository.name);

  constructor(
    private readonly eventStore: EventStore,
    private readonly snapshotStore: SnapshotStore,
    private readonly projectionManager: ProjectionManager,
  ) {}

  async save(studentRecord: StudentRecord): Promise<void> {
    const uncommittedEvents = studentRecord.uncommittedEvents;
    
    if (uncommittedEvents.length === 0) {
      return;
    }
    
    // Save events to the event store
    await this.eventStore.saveEvents(uncommittedEvents);
    
    // Apply events to projections
    await this.projectionManager.handleEvents(uncommittedEvents);
    
    // Create snapshot if needed
    if (studentRecord.version % SNAPSHOT_FREQUENCY === 0) {
      await this.createSnapshot(studentRecord);
    }
    
    // Clear uncommitted events from the aggregate
    studentRecord.clearEvents();
  }

  async getById(studentId: string): Promise<StudentRecord> {
    // Try to get the latest snapshot
    const snapshot = await this.snapshotStore.getLatestSnapshot<ReturnType<StudentRecord['getStudentSnapshot']>>(
      studentId,
      'StudentRecord',
    );
    
    // Create a new student record instance
    const studentRecord = new StudentRecord(studentId);
    
    // Apply snapshot state if available
    if (snapshot) {
      this.applySnapshot(studentRecord, snapshot);
    }
    
    // Get events since the snapshot version (or all events if no snapshot)
    const fromVersion = snapshot ? snapshot.version + 1 : 0;
    const events = await this.eventStore.getEventsByAggregate(studentId, 'StudentRecord');
    const newerEvents = events.filter(e => e.version >= fromVersion);
    
    // Apply events to rebuild the current state
    if (newerEvents.length > 0) {
      studentRecord.loadFromHistory(newerEvents);
    }
    
    return studentRecord;
  }

  async getByIdAtVersion(studentId: string, version: number): Promise<StudentRecord> {
    // Try to get the closest snapshot before the requested version
    const snapshot = await this.snapshotStore.getSnapshotByVersion<ReturnType<StudentRecord['getStudentSnapshot']>>(
      studentId,
      'StudentRecord',
      version,
    );
    
    // Create a new student record instance
    const studentRecord = new StudentRecord(studentId);
    
    // Apply snapshot state if available
    if (snapshot) {
      this.applySnapshot(studentRecord, snapshot);
    }
    
    // Get events up to the requested version
    const fromVersion = snapshot ? snapshot.version + 1 : 0;
    const events = await this.eventStore.getEventsByAggregateUpToVersion(
      studentId,
      'StudentRecord',
      version,
    );
    const relevantEvents = events.filter(e => e.version >= fromVersion && e.version <= version);
    
    // Apply events to rebuild the state at that version
    if (relevantEvents.length > 0) {
      studentRecord.loadFromHistory(relevantEvents);
    }
    
    return studentRecord;
  }

  async getByIdAtDate(studentId: string, date: Date): Promise<StudentRecord> {
    // Try to get the closest snapshot before the requested date
    const snapshot = await this.snapshotStore.getSnapshotByDate<ReturnType<StudentRecord['getStudentSnapshot']>>(
      studentId,
      'StudentRecord',
      date,
    );
    
    // Create a new student record instance
    const studentRecord = new StudentRecord(studentId);
    
    // Apply snapshot state if available
    if (snapshot) {
      this.applySnapshot(studentRecord, snapshot);
    }
    
    // Get events up to the requested date
    const events = await this.eventStore.getEventsByAggregateUpToDate(
      studentId,
      'StudentRecord',
      date,
    );
    const relevantEvents = snapshot
      ? events.filter(e => e.version > snapshot.version && new Date(e.timestamp) <= date)
      : events.filter(e => new Date(e.timestamp) <= date);
    
    // Apply events to rebuild the state at that date
    if (relevantEvents.length > 0) {
      studentRecord.loadFromHistory(relevantEvents);
    }
    
    return studentRecord;
  }

  private async createSnapshot(studentRecord: StudentRecord): Promise<void> {
    try {
      const snapshot: Snapshot<ReturnType<StudentRecord['getStudentSnapshot']>> = {
        aggregateId: studentRecord.id,
        aggregateType: 'StudentRecord',
        version: studentRecord.version,
        timestamp: new Date(),
        state: studentRecord.getStudentSnapshot(),
      };
      
      await this.snapshotStore.saveSnapshot(snapshot);
      this.logger.log(`Created snapshot for student ${studentRecord.id} at version ${studentRecord.version}`);
    } catch (error) {
      this.logger.error(`Failed to create snapshot for student ${studentRecord.id}`, error);
      // We don't throw here because snapshot creation is not critical
    }
  }

  private applySnapshot(
    studentRecord: StudentRecord,
    snapshot: Snapshot<ReturnType<StudentRecord['getStudentSnapshot']>>,
  ): void {
    // This is a simplified approach. In a real-world scenario, you might need a more complex reconstruction
    // from the snapshot depending on your domain model
    const events: DomainEvent[] = [];
    
    // The actual reconstruction would depend on the specific events and how they're handled
    // This is just a placeholder for the concept
    studentRecord.loadFromHistory(events);
  }
}