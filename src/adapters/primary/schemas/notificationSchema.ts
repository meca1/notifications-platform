import { z } from 'zod';

export const CreateNotificationSchema = z.object({
  client_id: z.string().min(1, 'Client ID is required'),
  event_id: z.string().min(1, 'Event ID is required'),
  event_type: z.string().min(1, 'Event type is required'),
  content: z.string().min(1, 'Content is required'),
});

export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>; 