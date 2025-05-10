export class NotificationNotFoundException extends Error {
  constructor(eventId: string) {
    super(`Notification with event ID ${eventId} not found`);
    this.name = 'NotificationNotFoundException';
  }
} 