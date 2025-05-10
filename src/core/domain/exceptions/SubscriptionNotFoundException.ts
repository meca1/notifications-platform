export class SubscriptionNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionNotFoundException';
  }
} 