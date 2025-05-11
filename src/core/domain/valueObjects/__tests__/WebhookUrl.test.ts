import { WebhookUrl } from '../WebhookUrl';

describe('WebhookUrl', () => {
  describe('create', () => {
    it('should create a valid webhook URL', () => {
      const url = 'https://webhook.example.com/endpoint';
      const webhookUrl = WebhookUrl.create(url);
      expect(webhookUrl.getValue()).toBe(url);
    });

    it('should throw error for invalid URL', () => {
      const invalidUrl = 'not-a-valid-url';
      expect(() => WebhookUrl.create(invalidUrl)).toThrow(`Invalid webhook URL: ${invalidUrl}`);
    });

    it('should accept URLs with different protocols', () => {
      const urls = [
        'https://webhook.example.com',
        'http://webhook.example.com',
        'https://webhook.example.com:8080',
        'https://webhook.example.com/path',
        'https://webhook.example.com/path?query=value',
        'https://webhook.example.com/path#fragment'
      ];

      urls.forEach(url => {
        const webhookUrl = WebhookUrl.create(url);
        expect(webhookUrl.getValue()).toBe(url);
      });
    });
  });

  describe('getValue', () => {
    it('should return the webhook URL value', () => {
      const url = 'https://webhook.example.com/endpoint';
      const webhookUrl = WebhookUrl.create(url);
      expect(webhookUrl.getValue()).toBe(url);
    });
  });

  describe('equals', () => {
    it('should return true for same webhook URL', () => {
      const url = 'https://webhook.example.com/endpoint';
      const webhookUrl1 = WebhookUrl.create(url);
      const webhookUrl2 = WebhookUrl.create(url);
      expect(webhookUrl1.equals(webhookUrl2)).toBe(true);
    });

    it('should return false for different webhook URLs', () => {
      const webhookUrl1 = WebhookUrl.create('https://webhook1.example.com');
      const webhookUrl2 = WebhookUrl.create('https://webhook2.example.com');
      expect(webhookUrl1.equals(webhookUrl2)).toBe(false);
    });
  });
}); 