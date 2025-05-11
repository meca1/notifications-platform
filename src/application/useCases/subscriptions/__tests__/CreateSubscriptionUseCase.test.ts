import { CreateSubscriptionUseCase } from '../CreateSubscriptionUseCase';
import { ISubscriptionRepository } from '../../../../core/ports/output/ISubscriptionRepository';
import { Subscription } from '../../../../core/domain/models/Subscription';
import { EventType } from '../../../../core/domain/valueObjects/EventType';
import { WebhookUrl } from '../../../../core/domain/valueObjects/WebhookUrl';
import { SubscriptionAlreadyExistsException } from '../../../../core/domain/exceptions/SubscriptionAlreadyExistsException';
import { InvalidWebhookUrlException } from '../../../../core/domain/exceptions/InvalidWebhookUrlException';

describe('CreateSubscriptionUseCase', () => {
  let createSubscriptionUseCase: CreateSubscriptionUseCase;
  let mockSubscriptionRepository: jest.Mocked<ISubscriptionRepository>;

  beforeEach(() => {
    mockSubscriptionRepository = {
      findByClientIdAndEventType: jest.fn(),
      findByClientId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ISubscriptionRepository>;

    createSubscriptionUseCase = new CreateSubscriptionUseCase(mockSubscriptionRepository);
  });

  describe('execute', () => {
    const validClientId = 'client-123';
    const validEventType = 'ORDER_CREATED';
    const validWebhookUrl = 'https://api.example.com/webhook';

    it('should create a subscription successfully', async () => {
      // Arrange
      mockSubscriptionRepository.findByClientIdAndEventType.mockResolvedValue(null);
      mockSubscriptionRepository.save.mockResolvedValue();

      // Act
      const result = await createSubscriptionUseCase.execute(
        validClientId,
        validEventType,
        validWebhookUrl
      );

      // Assert
      expect(result).toBeInstanceOf(Subscription);
      expect(result.clientId).toBe(validClientId);
      expect(result.eventType.getValue()).toBe(validEventType);
      expect(result.webhookUrl.getValue()).toBe(validWebhookUrl);
      expect(mockSubscriptionRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw InvalidWebhookUrlException for invalid webhook URL', async () => {
      // Arrange
      const invalidWebhookUrl = 'invalid-url';

      // Act & Assert
      await expect(
        createSubscriptionUseCase.execute(validClientId, validEventType, invalidWebhookUrl)
      ).rejects.toThrow(InvalidWebhookUrlException);
    });

    it('should throw SubscriptionAlreadyExistsException when subscription already exists', async () => {
      // Arrange
      const existingSubscription = new Subscription(
        validClientId,
        EventType.create(validEventType),
        WebhookUrl.create(validWebhookUrl)
      );
      mockSubscriptionRepository.findByClientIdAndEventType.mockResolvedValue(existingSubscription);

      // Act & Assert
      await expect(
        createSubscriptionUseCase.execute(validClientId, validEventType, validWebhookUrl)
      ).rejects.toThrow(SubscriptionAlreadyExistsException);
    });

    it('should throw error when repository save fails', async () => {
      // Arrange
      mockSubscriptionRepository.findByClientIdAndEventType.mockResolvedValue(null);
      const error = new Error('Database error');
      mockSubscriptionRepository.save.mockRejectedValue(error);

      // Act & Assert
      await expect(
        createSubscriptionUseCase.execute(validClientId, validEventType, validWebhookUrl)
      ).rejects.toThrow(error);
    });
  });
}); 