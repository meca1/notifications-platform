import { z } from 'zod';

export const CreateSubscriptionSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  eventType: z.string().min(1, 'Event type is required'),
  webhookUrl: z.string()
    .min(1, 'Webhook URL is required')
    .url('Invalid webhook URL format')
    .refine(
      (url) => url.startsWith('https://'),
      'Webhook URL must use HTTPS'
    ),
});

export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>; 