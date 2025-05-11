import { GenerateTokenUseCase } from '../GenerateTokenUseCase';
import jwt from 'jsonwebtoken';
import { logger } from '../../../../lib/logger';
import { Role } from '../../../../core/domain/constants/roles';

jest.mock('jsonwebtoken');
jest.mock('../../../../lib/logger');

describe('GenerateTokenUseCase', () => {
  let generateTokenUseCase: GenerateTokenUseCase;
  const mockJwtSecret = 'test-secret';
  const mockJwtExpiresIn = '1h';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = mockJwtSecret;
    process.env.JWT_EXPIRES_IN = mockJwtExpiresIn;
    generateTokenUseCase = new GenerateTokenUseCase();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
  });

  it('should generate token with basic parameters', async () => {
    const clientId = 'test-client';
    const mockToken = 'mock.jwt.token';
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    const result = await generateTokenUseCase.execute(clientId);

    expect(result).toBe(mockToken);
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: clientId,
        permissions: [],
        metadata: {},
      }),
      mockJwtSecret,
      expect.objectContaining({
        expiresIn: mockJwtExpiresIn,
      })
    );
    expect(logger.info).toHaveBeenCalledWith(
      'Token generated successfully',
      expect.objectContaining({
        clientId,
        permissions: 0,
        hasMetadata: false,
      })
    );
  });

  it('should generate token with permissions and metadata', async () => {
    const clientId = 'test-client';
    const permissions = ['read', 'write'];
    const metadata = { tenant: 'test-tenant' };
    const mockToken = 'mock.jwt.token';
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    const result = await generateTokenUseCase.execute(clientId, permissions, metadata);

    expect(result).toBe(mockToken);
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: clientId,
        permissions,
        metadata,
      }),
      mockJwtSecret,
      expect.any(Object)
    );
    expect(logger.info).toHaveBeenCalledWith(
      'Token generated successfully',
      expect.objectContaining({
        clientId,
        permissions: permissions.length,
        hasMetadata: true,
      })
    );
  });

  it('should generate token with role-based permissions', async () => {
    const clientId = 'test-client';
    const role = Role.ADMIN;
    const mockToken = 'mock.jwt.token';
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    const result = await generateTokenUseCase.execute(clientId, undefined, undefined, role);

    expect(result).toBe(mockToken);
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: clientId,
        role,
        permissions: expect.any(Array),
        metadata: {},
      }),
      mockJwtSecret,
      expect.any(Object)
    );
  });

  it('should use default values when environment variables are not set', async () => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
    
    const useCase = new GenerateTokenUseCase();
    
    const clientId = 'test-client';
    const mockToken = 'mock.jwt.token';
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    const result = await useCase.execute(clientId);

    expect(result).toBe(mockToken);
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.any(Object),
      'your-secret-key',
      expect.objectContaining({
        expiresIn: '1h',
      })
    );
  });

  it('should handle token generation errors', async () => {
    const clientId = 'test-client';
    const error = new Error('JWT signing failed');
    (jwt.sign as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await expect(generateTokenUseCase.execute(clientId)).rejects.toThrow('JWT signing failed');
    expect(logger.error).toHaveBeenCalledWith(
      'Error generating token',
      expect.objectContaining({
        clientId,
        error: expect.objectContaining({
          message: 'JWT signing failed',
          name: 'Error',
        }),
      })
    );
  });

  it('should include issued at timestamp in token payload', async () => {
    const clientId = 'test-client';
    const mockToken = 'mock.jwt.token';
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);

    await generateTokenUseCase.execute(clientId);

    const currentTimestamp = Math.floor(Date.now() / 1000);
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        iat: expect.any(Number),
      }),
      expect.any(String),
      expect.any(Object)
    );

    const callArgs = (jwt.sign as jest.Mock).mock.calls[0][0];
    expect(Math.abs(callArgs.iat - currentTimestamp)).toBeLessThan(2); // Allow 2 seconds difference
  });

  it('should handle non-Error objects in error handling', async () => {
    const clientId = 'test-client';
    const nonErrorObject = { customError: 'Something went wrong' };
    (jwt.sign as jest.Mock).mockImplementation(() => {
      throw nonErrorObject;
    });

    await expect(generateTokenUseCase.execute(clientId)).rejects.toBe(nonErrorObject);
    expect(logger.error).toHaveBeenCalledWith(
      'Error generating token',
      expect.objectContaining({
        clientId,
        error: nonErrorObject
      })
    );
  });
}); 