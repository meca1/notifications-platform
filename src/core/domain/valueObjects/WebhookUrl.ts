export class WebhookUrl {
  private constructor(private readonly value: string) {}

  static create(url: string): WebhookUrl {
    try {
      new URL(url);
      return new WebhookUrl(url);
    } catch (error) {
      throw new Error(`Invalid webhook URL: ${url}`);
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: WebhookUrl): boolean {
    return this.value === other.value;
  }
} 