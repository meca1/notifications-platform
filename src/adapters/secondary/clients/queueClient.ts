import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { env } from '../../../config/env';

export class QueueClient {
  private readonly client: SQSClient;
  private readonly queueUrl: string;

  constructor(queueUrl: string, endpoint?: string) {
    this.queueUrl = queueUrl;
    this.client = new SQSClient({
      region: env.region,
      endpoint: endpoint || env.sqsEndpoint,
      credentials: {
        accessKeyId: env.accessKeyId,
        secretAccessKey: env.secretAccessKey,
      },
    });
  }

  async sendMessage(messageBody: any): Promise<void> {
    await this.client.send(new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: typeof messageBody === 'string' ? messageBody : JSON.stringify(messageBody),
    }));
  }

  async receiveMessages(maxNumberOfMessages = 1): Promise<any[]> {
    const response = await this.client.send(new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: maxNumberOfMessages,
      WaitTimeSeconds: 1,
    }));
    return response.Messages || [];
  }

  async deleteMessage(receiptHandle: string): Promise<void> {
    await this.client.send(new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    }));
  }
} 