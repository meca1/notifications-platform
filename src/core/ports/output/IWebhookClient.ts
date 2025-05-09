export interface IWebhookClient {
  send(url: string, payload: any): Promise<void>;
} 