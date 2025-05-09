export interface IListNotificationsUseCase {
  execute(filters: NotificationFilters): Promise<NotificationDto[]>;
} 