import { GetNotificationsUseCase } from '../GetNotificationsUseCase';
import { INotificationRepository, NotificationFilters } from '../../../../core/ports/output/INotificationRepository';
import { Notification } from '../../../../core/domain/models/Notification';
import { DeliveryStatus } from '../../../../core/domain/valueObjects/DeliveryStatus';

describe('GetNotificationsUseCase', () => {
  let getNotificationsUseCase: GetNotificationsUseCase;
  let mockNotificationRepository: jest.Mocked<INotificationRepository>;

  beforeEach(() => {
    mockNotificationRepository = {
      findByClientId: jest.fn(),
      save: jest.fn(),
      findByEventId: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<INotificationRepository>;

    getNotificationsUseCase = new GetNotificationsUseCase(mockNotificationRepository);
  });

  it('should return notifications from the repository', async () => {
    const clientId = 'client-1';
    const notifications = [
      { eventId: 'e1', clientId, eventType: { getValue: () => 'ORDER_CREATED' }, content: 'c', createdAt: new Date(), deliveredAt: null, deliveryStatus: 'PENDING', retryCount: 0 } as unknown as Notification,
    ];
    mockNotificationRepository.findByClientId.mockResolvedValue(notifications);

    const result = await getNotificationsUseCase.execute(clientId);
    expect(result).toBe(notifications);
    expect(mockNotificationRepository.findByClientId).toHaveBeenCalledWith(clientId, undefined);
  });

  it('should pass filters to the repository', async () => {
    const clientId = 'client-1';
    const filters: Partial<NotificationFilters> = { status: DeliveryStatus.PENDING };
    mockNotificationRepository.findByClientId.mockResolvedValue([]);

    await getNotificationsUseCase.execute(clientId, filters);
    expect(mockNotificationRepository.findByClientId).toHaveBeenCalledWith(clientId, filters);
  });

  it('should propagate errors from the repository', async () => {
    const clientId = 'client-1';
    const error = new Error('Repo error');
    mockNotificationRepository.findByClientId.mockRejectedValue(error);

    await expect(getNotificationsUseCase.execute(clientId)).rejects.toThrow('Repo error');
  });
}); 