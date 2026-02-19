import { NextResponse } from 'next/server';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  handleError,
  withErrorHandler,
} from '@/lib/error-handler';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

// Mock NextResponse for testing
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data: unknown, init?: ResponseInit) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}));

describe('Error Handler', () => {
  describe('Custom Error Classes', () => {
    it('AppError should create error with custom status code', () => {
      const error = new AppError('Test error', 418, 'TEST_CODE');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(418);
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('AppError');
    });

    it('ValidationError should have 400 status code', () => {
      const error = new ValidationError('Invalid data', { field: 'email' });
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual({ field: 'email' });
    });

    it('UnauthorizedError should have 401 status code', () => {
      const error = new UnauthorizedError('Not authenticated');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('ForbiddenError should have 403 status code', () => {
      const error = new ForbiddenError('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });

    it('NotFoundError should have 404 status code', () => {
      const error = new NotFoundError('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });
  });

  describe('handleError', () => {
    it('should handle ValidationError correctly', () => {
      const error = new ValidationError('Invalid input', { field: 'email' });
      const response = handleError(error);
      
      expect(response.status).toBe(400);
      // Response structure is mocked
    });

    it('should handle UnauthorizedError correctly', () => {
      const error = new UnauthorizedError();
      const response = handleError(error);
      
      expect(response.status).toBe(401);
    });

    it('should handle NotFoundError correctly', () => {
      const error = new NotFoundError('User not found');
      const response = handleError(error);
      
      expect(response.status).toBe(404);
    });

    it('should handle Prisma unique constraint error', () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
          meta: { target: ['email'] }
        }
      );
      
      const response = handleError(error);
      expect(response.status).toBe(409);
    });

    it('should handle Prisma not found error', () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '5.0.0',
        }
      );
      
      const response = handleError(error);
      expect(response.status).toBe(404);
    });

    it('should handle ZodError correctly', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['email'],
          message: 'Expected string, received number'
        }
      ]);
      
      const response = handleError(zodError);
      expect(response.status).toBe(400);
    });

    it('should handle generic Error as 500', () => {
      const error = new Error('Something went wrong');
      const response = handleError(error);
      
      expect(response.status).toBe(500);
    });

    it('should handle unknown errors as 500', () => {
      const error = 'string error';
      const response = handleError(error);
      
      expect(response.status).toBe(500);
    });
  });

  describe('withErrorHandler', () => {
    it('should wrap handler and catch errors', async () => {
      const handler = withErrorHandler(async () => {
        throw new ValidationError('Test validation error');
      });

      const response = await handler();
      expect(response.status).toBe(400);
    });

    it('should pass through successful responses', async () => {
      const handler = withErrorHandler(async () => {
        return NextResponse.json({ success: true }, { status: 200 });
      });

      const response = await handler();
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ success: true });
    });

    it('should handle async errors', async () => {
      const handler = withErrorHandler(async () => {
        await Promise.resolve();
        throw new NotFoundError('Resource not found');
      });

      const response = await handler();
      expect(response.status).toBe(404);
    });

    it('should preserve handler arguments', async () => {
      const handler = withErrorHandler(async (arg1: string, arg2: number) => {
        return NextResponse.json({ arg1, arg2 });
      });

      const response = await handler('test', 123);
      const data = await response.json();
      expect(data).toEqual({ arg1: 'test', arg2: 123 });
    });
  });
});
