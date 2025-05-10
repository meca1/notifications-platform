import { IWebhookClient } from '../../../core/ports/output/IWebhookClient';
import axios from 'axios';
import { logger } from '../../../lib/logger';
import { httpConfig } from '../../../config/http';

export class HttpWebhookClient implements IWebhookClient {
  async send(url: string, payload: any): Promise<void> {
    try {
      logger.info('Sending webhook request', { url, payload });

      await axios.post(url, payload, {
        timeout: httpConfig.timeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Cobre-Notification-Service',
        },
      });

      logger.info('Webhook request successful', { url });
    } catch (error) {
      logger.error('Webhook request failed', { url, error });
      throw new Error(`Failed to send webhook to ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}