import { DomainEvent } from './events/base.event';

export abstract class AggregateRoot {
  readonly id: string;
  private _version: number = 0;
  private _events: DomainEvent[] = [];

  constructor(id: string) {
    this.id = id;
  }

  get version(): number {
    return this._version;
  }

  get uncommittedEvents(): DomainEvent[] {
    return [...this._events];
  }

  loadFromHistory(events: DomainEvent[]): void {
    events.forEach(event => {
      this.apply(event, false);
      this._version = event.version;
    });
  }

  protected applyEvent(event: DomainEvent): void {
    this.apply(event, true);
  }

  private apply(event: DomainEvent, isNew: boolean): void {
    const eventHandler = this.getEventHandler(event);
    if (eventHandler) {
      eventHandler.call(this, event);
    }

    if (isNew) {
      this._version++;
      this._events.push(event);
    }
  }

  private getEventHandler(event: DomainEvent): Function | null {
    const handlerName = `on${event.eventType}`;
    return this[handlerName] ? this[handlerName] : null;
  }

  clearEvents(): void {
    this._events = [];
  }
}