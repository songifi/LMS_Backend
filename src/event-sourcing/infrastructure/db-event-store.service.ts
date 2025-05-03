import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventStore, EventStoreQueryOptions } from './event-store.interface';
import { DomainEvent } from '../domain/events/base.event';

@Injectable()
export class MongoDbEventStore implements EventStore {
  private readonly logger = new Logger(MongoDbEventStore.name);

  constructor(
    @InjectModel('Event') private readonly eventModel: Model<DomainEvent & Document>,
  ) {}

  async saveEvents(events: DomainEvent[]): Promise<void> {
    try {
      await this.eventModel.insertMany(events);
      this.logger.log(`Saved ${events.length} events to the event store`);
    } catch (error) {
      this.logger.error('Failed to save events', error);
      throw error;
    }
  }

  async getEventsByAggregate(aggregateId: string, aggregateType: string): Promise<DomainEvent[]> {
    return this.eventModel.find({
      aggregateId,
      aggregateType,
    }).sort({ version: 1 }).lean().exec();
  }

  async getEventsByAggregateUpToVersion(
    aggregateId: string,
    aggregateType: string,
    version: number,
  ): Promise<DomainEvent[]> {
    return this.eventModel.find({
      aggregateId,
      aggregateType,
      version: { $lte: version },
    }).sort({ version: 1 }).lean().exec();
  }

  async getEventsByAggregateUpToDate(
    aggregateId: string,
    aggregateType: string,
    date: Date,
  ): Promise<DomainEvent[]> {
    return this.eventModel.find({
      aggregateId,
      aggregateType,
      timestamp: { $lte: date },
    }).sort({ version: 1 }).lean().exec();
  }

  async queryEvents(options: EventStoreQueryOptions): Promise<DomainEvent[]> {
    const query: any = {};

    if (options.aggregateId) {
      query.aggregateId = options.aggregateId;
    }

    if (options.aggregateType) {
      query.aggregateType = options.aggregateType;
    }

    if (options.eventTypes && options.eventTypes.length) {
      query.eventType = { $in: options.eventTypes };
    }

    if (options.fromVersion !== undefined || options.toVersion !== undefined) {
      query.version = {};
      
      if (options.fromVersion !== undefined) {
        query.version.$gte = options.fromVersion;
      }
      
      if (options.toVersion !== undefined) {
        query.version.$lte = options.toVersion;
      }
    }

    if (options.fromDate || options.toDate) {
      query.timestamp = {};
      
      if (options.fromDate) {
        query.timestamp.$gte = options.fromDate;
      }
      
      if (options.toDate) {
        query.timestamp.$lte = options.toDate;
      }
    }

    let queryBuilder = this.eventModel.find(query).sort({ timestamp: 1 });

    if (options.skip) {
      queryBuilder = queryBuilder.skip(options.skip);
    }

    if (options.limit) {
      queryBuilder = queryBuilder.limit(options.limit);
    }

    return queryBuilder.lean().exec();
  }

  async getAllEvents(): Promise<DomainEvent[]> {
    return this.eventModel.find().sort({ timestamp: 1 }).lean().exec();
  }
}
