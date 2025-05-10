import { Subscription } from '../../../core/domain/models/Subscription';
import { EventType } from '../../../core/domain/valueObjects/EventType';
import { WebhookUrl } from '../../../core/domain/valueObjects/WebhookUrl';
import { ICreateSubscriptionUseCase } from '../../../core/ports/input/ICreateSubscriptionUseCase';
import { ISubscriptionRepository } from '../../../core/ports/output/ISubscriptionRepository';
import { SubscriptionAlreadyExistsException } from '../../../core/domain/exceptions/SubscriptionAlreadyExistsException';
import { InvalidWebhookUrlException } from '../../../core/domain/exceptions/InvalidWebhookUrlException';
import { logger } from '../../../lib/logger';

export class CreateSubscriptionUseCase implements ICreateSubscriptionUseCase {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(clientId: string, eventType: string, webhookUrl: string): Promise<Subscription> {
    try {
      // Validar tipo de evento
      const validatedEventType = EventType.create(eventType);

      // Validar URL del webhook
      let validatedWebhookUrl: WebhookUrl;
      try {
        validatedWebhookUrl = WebhookUrl.create(webhookUrl);
      } catch (error) {
        throw new InvalidWebhookUrlException(webhookUrl);
      }

      // Verificar si ya existe una suscripción
      const existingSubscription = await this.subscriptionRepository.findByClientIdAndEventType(clientId, eventType);
      if (existingSubscription) {
        throw new SubscriptionAlreadyExistsException(clientId, eventType);
      }

      // Crear suscripción
      const subscription = new Subscription(
        clientId,
        validatedEventType,
        validatedWebhookUrl
      );

      // Guardar en el repositorio
      await this.subscriptionRepository.save(subscription);

      logger.info('Subscription created successfully', { clientId, eventType });
      return subscription;
    } catch (error) {
      logger.error('Error creating subscription', { clientId, eventType, error });
      throw error;
    }
  }
}