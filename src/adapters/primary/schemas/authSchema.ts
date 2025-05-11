import { z } from 'zod';
import { Role } from '../../../core/domain/constants/roles';

export const GenerateTokenSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  role: z.nativeEnum(Role).optional(),
  permissions: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type GenerateTokenInput = z.infer<typeof GenerateTokenSchema>; 