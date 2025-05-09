export interface IReplayNotificationUseCase {
  execute(id: string): Promise<void>;
} 