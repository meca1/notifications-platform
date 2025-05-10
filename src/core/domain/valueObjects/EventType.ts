export class EventType {
  private static readonly VALID_TYPES = [
    'PAYMENT_RECEIVED',
    'PAYMENT_FAILED',
    'ORDER_CREATED',
    'ORDER_UPDATED',
    'ORDER_CANCELLED',
    'SHIPMENT_CREATED',
    'SHIPMENT_DELIVERED',
    'REFUND_PROCESSED'
  ];

  private constructor(private readonly value: string) {}

  static create(type: string): EventType {
    if (!this.VALID_TYPES.includes(type)) {
      throw new Error(`Invalid event type: ${type}. Must be one of: ${this.VALID_TYPES.join(', ')}`);
    }
    return new EventType(type);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: EventType): boolean {
    return this.value === other.value;
  }
} 