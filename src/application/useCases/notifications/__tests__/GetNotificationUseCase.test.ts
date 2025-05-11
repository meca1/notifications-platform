import { GetNotificationUseCase } from '../GetNotificationUseCase';
import { INotificationRepository } from '../../../../core/ports/output/INotificationRepository';
import { Notification } from '../../../../core/domain/models/Notification';
import { NotificationNotFoundException } from '../../../../core/domain/exceptions/NotificationNotFoundException';

describe('GetNotificationUseCase', () => {
  let getNotificationUseCase: GetNotificationUseCase;
  let mockNotificationRepository: jest.Mocked<INotificationRepository>;

  beforeEach(() => {
    mockNotificationRepository = {
      findByEventId: jest.fn(),
      findByClientId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<INotificationRepository>;
    getNotificationUseCase = new GetNotificationUseCase(mockNotificationRepository);
  });

  it('should return the notification if it exists and belongs to the client', async () => {
    const eventId = 'event-1';
    const clientId = 'client-1';
    const notification = { eventId, clientId } as Notification;
    mockNotificationRepository.findByEventId.mockResolvedValue(notification);

    const result = await getNotificationUseCase.execute(eventId, clientId);
    expect(result).toBe(notification);
  });

  it('should throw NotificationNotFoundException if notification does not exist', async () => {
    const eventId = 'event-1';
    const clientId = 'client-1';
    mockNotificationRepository.findByEventId.mockResolvedValue(undefined as unknown as Notification);

    await expect(getNotificationUseCase.execute(eventId, clientId))
      .rejects.toThrow(NotificationNotFoundException);
    await expect(getNotificationUseCase.execute(eventId, clientId))
      .rejects.toThrow(`Notification with event ID ${eventId} not found`);
  });

  it('should throw NotificationNotFoundException if notification does not belong to the client', async () => {
    const eventId = 'event-1';
    const clientId = 'client-1';
    const notification = { eventId, clientId: 'other-client' } as Notification;
    mockNotificationRepository.findByEventId.mockResolvedValue(notification);

    await expect(getNotificationUseCase.execute(eventId, clientId)).rejects.toThrow(NotificationNotFoundException);
  });
}); 