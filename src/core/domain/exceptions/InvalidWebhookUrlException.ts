export class InvalidWebhookUrlException extends Error {
    constructor(url: string) {
      super(`Invalid webhook URL: ${url}`);
      this.name = 'InvalidWebhookUrlException';
    }
}