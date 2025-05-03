export abstract class DomainEvent {
    readonly id: string;
    readonly aggregateId: string;
    readonly aggregateType: string;
    readonly version: number;
    readonly timestamp: Date;
    readonly eventType: string;
    readonly metadata: Record<string, any>;
  
    constructor(params: {
      aggregateId: string;
      aggregateType: string;
      version: number;
      eventType: string;
      metadata?: Record<string, any>;
    }) {
      this.id = this.generateUuid();
      this.aggregateId = params.aggregateId;
      this.aggregateType = params.aggregateType;
      this.version = params.version;
      this.timestamp = new Date();
      this.eventType = params.eventType;
      this.metadata = params.metadata || {};
    }
  
    private generateUuid(): string {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }
  