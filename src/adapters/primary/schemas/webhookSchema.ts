import { z } from 'zod';

// Schema para el mensaje SQS que contiene el eventId
export const WebhookMessageSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
});

// Schema para el payload del webhook
export const WebhookPayloadSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  eventType: z.string().min(1, 'Event type is required'),
  content: z.string().min(1, 'Content is required'),
  creationDate: z.string().datetime('Invalid creation date format'),
});

export type WebhookMessage = z.infer<typeof WebhookMessageSchema>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>; 