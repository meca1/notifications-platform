export class DeliveryFailedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeliveryFailedException';
  }
} 