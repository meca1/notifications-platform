export interface IGetNotificationUseCase {
  execute(id: string): Promise<NotificationDto>;
} 