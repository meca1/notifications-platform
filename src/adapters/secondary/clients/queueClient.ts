import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { env } from '../../../config/env';
import { IQueueClient } from '../../../core/ports/output/IQueueClient';

export class QueueClient implements IQueueClient {
  private readonly client: SQSClient;
  private readonly queueUrl: string;

  constructor(queueUrl: string) {
    this.queueUrl = queueUrl;
    this.client = new SQSClient({
      region: env.region
    });
  }

  async sendMessage(messageBody: any): Promise<void> {
    try {
      await this.client.send(new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: typeof messageBody === 'string' ? messageBody : JSON.stringify(messageBody),
      }));
    } catch (error) {
      console.error('Error sending message to SQS:', error);
      throw error;
    }
  }

  async receiveMessages(maxNumberOfMessages = 1): Promise<any[]> {
    try {
      const response = await this.client.send(new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: maxNumberOfMessages,
        WaitTimeSeconds: 1,
      }));
      return response.Messages || [];
    } catch (error) {
      console.error('Error receiving messages from SQS:', error);
      throw error;
    }
  }

  async deleteMessage(receiptHandle: string): Promise<void> {
    try {
      await this.client.send(new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      }));
    } catch (error) {
      console.error('Error deleting message from SQS:', error);
      throw error;
    }
  }
} 