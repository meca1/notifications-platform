import { Role } from '../../domain/constants/roles';

export interface IGenerateTokenUseCase {
  execute(
    clientId: string, 
    permissions?: string[], 
    metadata?: Record<string, any>,
    role?: Role
  ): Promise<string>;
} 