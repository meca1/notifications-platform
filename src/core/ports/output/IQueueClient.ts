export interface IQueueClient {
  sendMessage(messageBody: any): Promise<void>;
  receiveMessages(maxNumberOfMessages?: number): Promise<any[]>;
  deleteMessage(receiptHandle: string): Promise<void>;
} 