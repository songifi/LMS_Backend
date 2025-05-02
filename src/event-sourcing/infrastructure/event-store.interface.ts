import { DomainEvent } from '../domain/events/base.event';

export interface EventStoreQueryOptions {
  aggregateType?: string;
  aggregateId?: string;
  eventTypes?: string[];
  fromVersion?: number;
  toVersion?: number;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  skip?: number;
}

export interface EventStore {
  saveEvents(events: DomainEvent[]): Promise<void>;
  getEventsByAggregate(aggregateId: string, aggregateType: string): Promise<DomainEvent[]>;
  getEventsByAggregateUpToVersion(
    aggregateId: string, 
    aggregateType: string, 
    version: number
  ): Promise<DomainEvent[]>;
  getEventsByAggregateUpToDate(
    aggregateId: string, 
    aggregateType: string, 
    date: Date
  ): Promise<DomainEvent[]>;
  queryEvents(options: EventStoreQueryOptions): Promise<DomainEvent[]>;
  getAllEvents(): Promise<DomainEvent[]>;
}
