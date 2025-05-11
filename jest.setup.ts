import { logger } from './src/lib/logger';

// Mock all logger methods
jest.mock('./src/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
})); 