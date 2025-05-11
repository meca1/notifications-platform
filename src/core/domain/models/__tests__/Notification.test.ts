import { Notification } from '../Notification';
import { DeliveryStatus } from '../../valueObjects/DeliveryStatus';
import { EventType } from '../../valueObjects/EventType';

describe('Notification', () => {
  let notification: Notification;
  const mockEventId = 'event-1';
  const mockClientId = 'client-1';
  const mockEventType = { getValue: () => 'ORDER_CREATED' } as EventType;
  const mockContent = 'Test notification content';
  const mockCreationDate = new Date('2024-01-01T00:00:00Z');

  beforeEach(() => {
    notification = new Notification(
      mockEventId,
      mockClientId,
      mockEventType,
      mockContent,
      mockCreationDate,
      null,
      DeliveryStatus.PENDING
    );
  });

  describe('constructor', () => {
    it('should create a notification with default retryCount', () => {
      expect(notification.retryCount).toBe(0);
    });

    it('should create a notification with custom retryCount', () => {
      const notificationWithRetries = new Notification(
        mockEventId,
        mockClientId,
        mockEventType,
        mockContent,
        mockCreationDate,
        null,
        DeliveryStatus.PENDING,
        2
      );
      expect(notificationWithRetries.retryCount).toBe(2);
    });

    it('should create a notification with error message', () => {
      const errorMessage = 'Test error';
      const notificationWithError = new Notification(
        mockEventId,
        mockClientId,
        mockEventType,
        mockContent,
        mockCreationDate,
        null,
        DeliveryStatus.FAILED,
        0,
        errorMessage
      );
      expect(notificationWithError.errorMessage).toBe(errorMessage);
    });
  });

  describe('markAsDelivered', () => {
    it('should mark notification as delivered and set delivery date', () => {
      const beforeDate = new Date();
      notification.markAsDelivered();
      const afterDate = new Date();

      expect(notification.deliveryStatus).toBe(DeliveryStatus.COMPLETED);
      expect(notification.deliveryDate).toBeInstanceOf(Date);
      expect(notification.deliveryDate!.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
      expect(notification.deliveryDate!.getTime()).toBeLessThanOrEqual(afterDate.getTime());
    });
  });

  describe('markAsFailed', () => {
    it('should mark notification as failed, set delivery date and error message', () => {
      const error = 'Test error message';
      const beforeDate = new Date();
      notification.markAsFailed(error);
      const afterDate = new Date();

      expect(notification.deliveryStatus).toBe(DeliveryStatus.FAILED);
      expect(notification.deliveryDate).toBeInstanceOf(Date);
      expect(notification.deliveryDate!.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
      expect(notification.deliveryDate!.getTime()).toBeLessThanOrEqual(afterDate.getTime());
      expect(notification.errorMessage).toBe(error);
    });
  });

  describe('incrementRetryCount', () => {
    it('should increment retry count by 1', () => {
      const initialCount = notification.retryCount;
      notification.incrementRetryCount();
      expect(notification.retryCount).toBe(initialCount + 1);
    });

    it('should increment retry count multiple times', () => {
      notification.incrementRetryCount();
      notification.incrementRetryCount();
      expect(notification.retryCount).toBe(2);
    });
  });
}); 