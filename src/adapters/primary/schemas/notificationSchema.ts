import { z } from 'zod';
import { DeliveryStatus } from '../../../core/domain/valueObjects/DeliveryStatus';

export const CreateNotificationSchema = z.object({
  client_id: z.string().min(1, 'Client ID is required'),
  event_id: z.string().min(1, 'Event ID is required'),
  event_type: z.string().min(1, 'Event type is required'),
  content: z.string().min(1, 'Content is required'),
});

export const GetNotificationParamsSchema = z.object({
  id: z.string().min(1, 'Notification ID is required'),
});

export const GetNotificationsQuerySchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  status: z.nativeEnum(DeliveryStatus).optional(),
  fromDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid fromDate format. Use ISO 8601 format.')
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return parsedDate <= new Date();
    }, 'fromDate cannot be in the future'),
  toDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Invalid toDate format. Use ISO 8601 format.')
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return parsedDate <= new Date();
    }, 'toDate cannot be in the future'),
}).refine((data) => {
  if (!data.fromDate || !data.toDate) return true;
  return new Date(data.fromDate) <= new Date(data.toDate);
}, 'fromDate cannot be later than toDate');

export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;
export type GetNotificationParams = z.infer<typeof GetNotificationParamsSchema>;
export type GetNotificationsQuery = z.infer<typeof GetNotificationsQuerySchema>; 