import { ReplayNotificationUseCase } from '../ReplayNotificationUseCase';
import { INotificationRepository } from '../../../../core/ports/output/INotificationRepository';
import { IQueueClient } from '../../../../core/ports/output/IQueueClient';
import { Notification } from '../../../../core/domain/models/Notification';
import { NotificationNotFoundException } from '../../../../core/domain/exceptions/NotificationNotFoundException';
import { DeliveryStatus } from '../../../../core/domain/valueObjects/DeliveryStatus';
import { logger } from '../../../../lib/logger';

describe('ReplayNotificationUseCase', () => {
  let replayNotificationUseCase: ReplayNotificationUseCase;
  let mockNotificationRepository: jest.Mocked<INotificationRepository>;
  let mockQueueClient: jest.Mocked<IQueueClient>;
  let notification: Notification;

  beforeEach(() => {
    jest.clearAllMocks();

    mockNotificationRepository = {
      findByEventId: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      findByClientId: jest.fn(),
    } as unknown as jest.Mocked<INotificationRepository>;

    mockQueueClient = {
      sendMessage: jest.fn(),
      receiveMessages: jest.fn(),
      deleteMessage: jest.fn(),
    } as unknown as jest.Mocked<IQueueClient>;

    replayNotificationUseCase = new ReplayNotificationUseCase(
      mockNotificationRepository,
      mockQueueClient
    );

    notification = {
      eventId: 'event-1',
      clientId: 'client-1',
      eventType: { getValue: () => 'ORDER_CREATED' },
      content: 'Test content',
      creationDate: new Date(),
      deliveryDate: new Date(),
      deliveryStatus: DeliveryStatus.FAILED,
      retryCount: 3,
      errorMessage: 'Previous error',
    } as unknown as Notification;
  });

  it('should successfully replay a notification', async () => {
    const eventId = 'event-1';
    const clientId = 'client-1';
    mockNotificationRepository.findByEventId.mockResolvedValue(notification);
    mockNotificationRepository.update.mockResolvedValue();
    mockQueueClient.sendMessage.mockResolvedValue();

    const result = await replayNotificationUseCase.execute(eventId, clientId);

    expect(result).toBe(notification);
    expect(result.retryCount).toBe(0);
    expect(result.deliveryStatus).toBe(DeliveryStatus.PENDING);
    expect(result.deliveryDate).toBeNull();
    expect(result.errorMessage).toBeUndefined();
    expect(mockNotificationRepository.update).toHaveBeenCalledWith(notification);
    expect(mockQueueClient.sendMessage).toHaveBeenCalledWith({
      eventId: notification.eventId,
      clientId: notification.clientId,
      eventType: notification.eventType.getValue(),
    });
    expect(logger.info).toHaveBeenCalledTimes(2);
  });

  it('should throw NotificationNotFoundException if notification does not exist', async () => {
    const eventId = 'event-1';
    const clientId = 'client-1';
    mockNotificationRepository.findByEventId.mockResolvedValue(undefined as unknown as Notification);

    await expect(replayNotificationUseCase.execute(eventId, clientId))
      .rejects.toThrow(NotificationNotFoundException);
    await expect(replayNotificationUseCase.execute(eventId, clientId))
      .rejects.toThrow(`Notification with event ID ${eventId} not found`);
  });

  it('should throw NotificationNotFoundException if notification does not belong to client', async () => {
    const eventId = 'event-1';
    const clientId = 'client-1';
    const otherClientNotification = { ...notification, clientId: 'other-client' };
    mockNotificationRepository.findByEventId.mockResolvedValue(otherClientNotification as Notification);

    await expect(replayNotificationUseCase.execute(eventId, clientId))
      .rejects.toThrow(NotificationNotFoundException);
  });

  it('should propagate error if repository update fails', async () => {
    const eventId = 'event-1';
    const clientId = 'client-1';
    const error = new Error('Update failed');
    mockNotificationRepository.findByEventId.mockResolvedValue(notification);
    mockNotificationRepository.update.mockRejectedValue(error);

    await expect(replayNotificationUseCase.execute(eventId, clientId))
      .rejects.toThrow('Update failed');
  });

  it('should propagate error if queue send fails', async () => {
    const eventId = 'event-1';
    const clientId = 'client-1';
    const error = new Error('Queue error');
    mockNotificationRepository.findByEventId.mockResolvedValue(notification);
    mockNotificationRepository.update.mockResolvedValue();
    mockQueueClient.sendMessage.mockRejectedValue(error);

    await expect(replayNotificationUseCase.execute(eventId, clientId))
      .rejects.toThrow('Queue error');
  });
}); 