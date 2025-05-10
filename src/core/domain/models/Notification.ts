// src/core/domain/models/Notification.ts
import { DeliveryStatus } from '../valueObjects/DeliveryStatus';
import { EventType } from '../valueObjects/EventType';

export class Notification {
  constructor(
    public readonly eventId: string,
    public readonly clientId: string,
    public readonly eventType: EventType,
    public readonly content: string,
    public readonly creationDate: Date,
    public deliveryDate: Date | null,
    public deliveryStatus: DeliveryStatus,
    public retryCount: number = 0,
    public errorMessage?: string
  ) {}

  markAsDelivered(): void {
    this.deliveryStatus = DeliveryStatus.COMPLETED;
    this.deliveryDate = new Date();
  }

  markAsFailed(error: string): void {
    this.deliveryStatus = DeliveryStatus.FAILED;
    this.deliveryDate = new Date();
    this.errorMessage = error;
  }

  incrementRetryCount(): void {
    this.retryCount += 1;
  }

  canBeRetried(): boolean {
    return this.deliveryStatus === DeliveryStatus.FAILED && this.retryCount < 3;
  }
}