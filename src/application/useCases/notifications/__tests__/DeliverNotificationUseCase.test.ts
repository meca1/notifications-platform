import { DeliverNotificationUseCase } from '../DeliverNotificationUseCase';
import { IWebhookClient } from '../../../../core/ports/output/IWebhookClient';
import { INotificationRepository } from '../../../../core/ports/output/INotificationRepository';
import { ISubscriptionRepository } from '../../../../core/ports/output/ISubscriptionRepository';
import { Notification } from '../../../../core/domain/models/Notification';
import { DeliveryFailedException } from '../../../../core/domain/exceptions/DeliveryFailedException';
import { DeliveryStatus } from '../../../../core/domain/valueObjects/DeliveryStatus';
import { logger } from '../../../../lib/logger';

describe('DeliverNotificationUseCase', () => {
  let deliverNotificationUseCase: DeliverNotificationUseCase;
  let mockWebhookClient: jest.Mocked<IWebhookClient>;
  let mockNotificationRepository: jest.Mocked<INotificationRepository>;
  let mockSubscriptionRepository: jest.Mocked<ISubscriptionRepository>;
  let notification: Notification;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    mockWebhookClient = {
      send: jest.fn(),
    } as unknown as jest.Mocked<IWebhookClient>;
    mockNotificationRepository = {
      update: jest.fn(),
      save: jest.fn(),
      findByClientId: jest.fn(),
      findByEventId: jest.fn(),
    } as unknown as jest.Mocked<INotificationRepository>;
    mockSubscriptionRepository = {
      findByClientIdAndEventType: jest.fn(),
      findByClientId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ISubscriptionRepository>;

    deliverNotificationUseCase = new DeliverNotificationUseCase(
      mockWebhookClient,
      mockNotificationRepository,
      mockSubscriptionRepository
    );

    notification = {
      eventId: 'event-1',
      clientId: 'client-1',
      eventType: { getValue: () => 'ORDER_CREATED' },
      content: 'Test content',
      creationDate: new Date(),
      deliveryDate: null,
      deliveryStatus: DeliveryStatus.PENDING,
      retryCount: 0,
      markAsDelivered: jest.fn(function (this: Notification) {
        this.deliveryStatus = DeliveryStatus.COMPLETED;
        this.deliveryDate = new Date();
      }),
      markAsFailed: jest.fn(function (this: Notification, _msg: string) {
        this.deliveryStatus = DeliveryStatus.FAILED;
      }),
      incrementRetryCount: jest.fn(function (this: Notification) {
        this.retryCount++;
      }),
    } as unknown as Notification;
  });

  it('should deliver and mark notification as delivered', async () => {
    const subscription = {
      webhookUrl: { getValue: () => 'https://webhook.url' },
      isActive: true,
    };
    mockSubscriptionRepository.findByClientIdAndEventType.mockResolvedValue(subscription as any);
    mockWebhookClient.send.mockResolvedValue();
    mockNotificationRepository.update.mockResolvedValue();

    await deliverNotificationUseCase.execute(notification);

    expect(mockWebhookClient.send).toHaveBeenCalledWith('https://webhook.url', expect.any(Object));
    expect(notification.markAsDelivered).toHaveBeenCalled();
    expect(mockNotificationRepository.update).toHaveBeenCalledWith(notification);
    expect(logger.info).toHaveBeenCalled();
  });

  it('should mark as failed if no subscription found', async () => {
    mockSubscriptionRepository.findByClientIdAndEventType.mockResolvedValue(null);
    mockNotificationRepository.update.mockResolvedValue();

    await deliverNotificationUseCase.execute(notification);

    expect(notification.markAsFailed).toHaveBeenCalledWith('No active subscription found for this event type');
    expect(mockNotificationRepository.update).toHaveBeenCalledWith(notification);
    expect(logger.warn).toHaveBeenCalled();
  });

  it('should handle webhook send failure and throw DeliveryFailedException', async () => {
    const subscription = {
      webhookUrl: { getValue: () => 'https://webhook.url' },
      isActive: true,
    };
    mockSubscriptionRepository.findByClientIdAndEventType.mockResolvedValue(subscription as any);
    mockWebhookClient.send.mockRejectedValue(new Error('Webhook error'));
    mockNotificationRepository.update.mockResolvedValue();

    await expect(deliverNotificationUseCase.execute(notification)).rejects.toThrow(DeliveryFailedException);
    expect(notification.incrementRetryCount).toHaveBeenCalled();
    expect(notification.markAsFailed).toHaveBeenCalledWith('Webhook error');
    expect(mockNotificationRepository.update).toHaveBeenCalledWith(notification);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle unexpected errors and throw DeliveryFailedException', async () => {
    mockSubscriptionRepository.findByClientIdAndEventType.mockRejectedValue(new Error('Unexpected error'));
    mockNotificationRepository.update.mockResolvedValue();

    await expect(deliverNotificationUseCase.execute(notification)).rejects.toThrow(DeliveryFailedException);
    expect(notification.incrementRetryCount).toHaveBeenCalled();
    expect(notification.markAsFailed).toHaveBeenCalledWith('Unexpected error');
    expect(mockNotificationRepository.update).toHaveBeenCalledWith(notification);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle non-Error objects in error handling', async () => {
    const subscription = {
      webhookUrl: { getValue: () => 'https://webhook.url' },
      isActive: true,
    };
    mockSubscriptionRepository.findByClientIdAndEventType.mockResolvedValue(subscription as any);
    const nonErrorObject = { customError: 'Something went wrong' };
    mockWebhookClient.send.mockRejectedValue(nonErrorObject);
    mockNotificationRepository.update.mockResolvedValue();

    await expect(deliverNotificationUseCase.execute(notification)).rejects.toThrow(DeliveryFailedException);
    expect(notification.incrementRetryCount).toHaveBeenCalled();
    expect(notification.markAsFailed).toHaveBeenCalledWith('Unknown error');
    expect(mockNotificationRepository.update).toHaveBeenCalledWith(notification);
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to deliver notification',
      expect.objectContaining({
        eventId: notification.eventId,
        error: nonErrorObject
      })
    );
  });
}); 