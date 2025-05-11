import { CreateNotificationUseCase } from '../CreateNotificationUseCase';
import { INotificationRepository } from '../../../../core/ports/output/INotificationRepository';
import { IQueueClient } from '../../../../core/ports/output/IQueueClient';
import { Notification } from '../../../../core/domain/models/Notification';
import { EventType } from '../../../../core/domain/valueObjects/EventType';
import { DeliveryStatus } from '../../../../core/domain/valueObjects/DeliveryStatus';

describe('CreateNotificationUseCase', () => {
  let createNotificationUseCase: CreateNotificationUseCase;
  let mockNotificationRepository: jest.Mocked<INotificationRepository>;
  let mockQueueClient: jest.Mocked<IQueueClient>;

  beforeEach(() => {
    mockNotificationRepository = {
      save: jest.fn(),
      findByClientId: jest.fn(),
      findByEventId: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<INotificationRepository>;

    mockQueueClient = {
      sendMessage: jest.fn(),
      receiveMessages: jest.fn(),
      deleteMessage: jest.fn(),
    } as unknown as jest.Mocked<IQueueClient>;

    createNotificationUseCase = new CreateNotificationUseCase(
      mockNotificationRepository,
      mockQueueClient
    );
  });

  describe('execute', () => {
    const clientId = 'client-1';
    const eventId = 'event-1';
    const eventType = 'ORDER_CREATED';
    const content = 'Test notification';

    it('should create and queue a notification successfully', async () => {
      mockNotificationRepository.save.mockResolvedValue();
      mockQueueClient.sendMessage.mockResolvedValue();

      const result = await createNotificationUseCase.execute(
        clientId,
        eventId,
        eventType,
        content
      );

      expect(result).toBeInstanceOf(Notification);
      expect(result.eventId).toBe(eventId);
      expect(result.clientId).toBe(clientId);
      expect(result.eventType.getValue()).toBe(eventType);
      expect(result.content).toBe(content);
      expect(result.deliveryStatus).toBe(DeliveryStatus.PENDING);
      expect(mockNotificationRepository.save).toHaveBeenCalledTimes(1);
      expect(mockQueueClient.sendMessage).toHaveBeenCalledWith({
        eventId,
        clientId,
        eventType,
      });
    });

    it('should throw if eventType is invalid', async () => {
      const invalidEventType = 'INVALID_TYPE';
      await expect(
        createNotificationUseCase.execute(clientId, eventId, invalidEventType, content)
      ).rejects.toThrow();
    });

    it('should throw if repository save fails', async () => {
      mockNotificationRepository.save.mockRejectedValue(new Error('Repo error'));
      await expect(
        createNotificationUseCase.execute(clientId, eventId, eventType, content)
      ).rejects.toThrow('Repo error');
    });

    it('should throw if queueClient.sendMessage fails', async () => {
      mockNotificationRepository.save.mockResolvedValue();
      mockQueueClient.sendMessage.mockRejectedValue(new Error('Queue error'));
      await expect(
        createNotificationUseCase.execute(clientId, eventId, eventType, content)
      ).rejects.toThrow('Queue error');
    });
  });
}); 