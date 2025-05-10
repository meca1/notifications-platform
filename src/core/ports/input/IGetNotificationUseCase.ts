import { Notification } from '../../domain/models/Notification';

export interface IGetNotificationUseCase {
  execute(id: string, clientId: string): Promise<Notification>;
}