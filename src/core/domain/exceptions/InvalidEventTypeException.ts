export class InvalidEventTypeException extends Error {
  constructor(eventType: string) {
    super(`Invalid event type: ${eventType}`);
    this.name = 'InvalidEventTypeException';
  }
} 