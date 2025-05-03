import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DomainEvent } from '../../domain/events/base.event';
import { EventStore } from '../event-store.interface';
import { Projection } from './projection.interface';

@Injectable()
export class ProjectionManager implements OnModuleInit {
  private readonly logger = new Logger(ProjectionManager.name);
  private projections: Projection<any>[] = [];

  constructor(
    private readonly eventStore: EventStore,
    private readonly moduleRef: ModuleRef,
  ) {}

  async onModuleInit() {
    // Get all registered projections from the module
    this.projections = [
      this.moduleRef.get(StudentGradesProjection),
      this.moduleRef.get(StudentEnrollmentsProjection),
      this.moduleRef.get(DegreeProgressProjection),
    ];
    
    this.logger.log(`Initialized ${this.projections.length} projections`);
  }

  async handleEvent(event: DomainEvent): Promise<void> {
    for (const projection of this.projections) {
      await projection.handleEvent(event);
    }
  }

  async handleEvents(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.handleEvent(event);
    }
  }

  async rebuildProjection(projectionName: string): Promise<void> {
    const projection = this.projections.find(p => p.name === projectionName);
    
    if (!projection) {
      throw new Error(`Projection ${projectionName} not found`);
    }
    
    this.logger.log(`Rebuilding projection ${projectionName}`);
    
    // Reset the projection
    await projection.reset();
    
    // Get all events from the event store
    const events = await this.eventStore.getAllEvents();
    
    // Apply events to the projection in order
    for (const event of events) {
      await projection.handleEvent(event);
    }
    
    this.logger.log(`Projection ${projectionName} rebuilt with ${events.length} events`);
  }

  async rebuildAllProjections(): Promise<void> {
    this.logger.log('Rebuilding all projections');
    
    // Get all events from the event store
    const events = await this.eventStore.getAllEvents();
    
    // Reset and rebuild each projection
    for (const projection of this.projections) {
      await projection.reset();
      
      for (const event of events) {
        await projection.handleEvent(event);
      }
      
      this.logger.log(`Projection ${projection.name} rebuilt with ${events.length} events`);
    }
  }
}
