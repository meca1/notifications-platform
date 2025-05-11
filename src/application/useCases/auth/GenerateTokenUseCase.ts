import { IGenerateTokenUseCase } from '../../../core/ports/input/IGenerateTokenUseCase';
import jwt, { SignOptions } from 'jsonwebtoken';
import { logger } from '../../../lib/logger';
import { Role, RolePermissions } from '../../../core/domain/constants/roles';

export class GenerateTokenUseCase implements IGenerateTokenUseCase {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
  }

  async execute(
    clientId: string, 
    permissions?: string[], 
    metadata?: Record<string, any>,
    role?: Role
  ): Promise<string> {
    try {
      // Get permissions based on role if not explicitly provided
      const effectivePermissions = permissions || 
        (role ? RolePermissions[role] : []);

      const payload = {
        // Standard JWT claims
        sub: clientId,                    // Subject (client identifier)
        iat: Math.floor(Date.now() / 1000), // Issued at
        // Custom claims
        role,
        permissions: effectivePermissions,
        metadata: metadata || {}
      };

      const options: SignOptions = {
        expiresIn: this.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      };

      const token = jwt.sign(payload, this.JWT_SECRET, options);

      logger.info('Token generated successfully', { 
        clientId,
        role,
        permissions: effectivePermissions.length,
        hasMetadata: !!metadata
      });

      return token;
    } catch (error) {
      logger.error('Error generating token', { 
        clientId,
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : error
      });
      throw error;
    }
  }
} 