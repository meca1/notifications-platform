export class SubscriptionAlreadyExistsException extends Error {
    constructor(clientId: string, eventType: string) {
      super(`Subscription already exists for client ${clientId} and event type ${eventType}`);
      this.name = 'SubscriptionAlreadyExistsException';
    }
  }