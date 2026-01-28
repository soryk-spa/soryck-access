import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ClerkAPIError } from '@clerk/nextjs/errors';
import { ZodError } from 'zod';

/**
 * Tipos de errores personalizados
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso denegado') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Mapea errores conocidos a respuestas apropiadas
 */
function mapErrorToResponse(error: unknown): {
  message: string;
  statusCode: number;
  code?: string;
  details?: any;
} {
  // Errores personalizados
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    };
  }

  // Errores de validación Zod
  if (error instanceof ZodError) {
    return {
      message: 'Datos inválidos',
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  }

  // Errores de Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          message: 'Ya existe un registro con estos datos',
          statusCode: 409,
          code: 'DUPLICATE_ENTRY',
        };
      case 'P2025':
        return {
          message: 'Registro no encontrado',
          statusCode: 404,
          code: 'NOT_FOUND',
        };
      case 'P2003':
        return {
          message: 'Referencia inválida',
          statusCode: 400,
          code: 'FOREIGN_KEY_CONSTRAINT',
        };
      default:
        return {
          message: 'Error en la base de datos',
          statusCode: 500,
          code: 'DATABASE_ERROR',
        };
    }
  }

  // Errores de Clerk
  if (error instanceof ClerkAPIError) {
    return {
      message: 'Error de autenticación',
      statusCode: 401,
      code: 'AUTH_ERROR',
    };
  }

  // Error por defecto
  if (error instanceof Error) {
    // En desarrollo, mostrar el mensaje real
    if (process.env.NODE_ENV === 'development') {
      return {
        message: error.message,
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
      };
    }
  }

  // Error genérico para producción
  return {
    message: 'Error interno del servidor',
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
  };
}

/**
 * Handler centralizado de errores para API routes
 */
export function handleError(error: unknown): NextResponse {
  const { message, statusCode, code, details } = mapErrorToResponse(error);

  // Log del error (en producción usar logger apropiado)
  console.error('API Error:', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    statusCode,
    code,
    timestamp: new Date().toISOString(),
  });

  const response: any = {
    error: message,
    code,
    timestamp: new Date().toISOString(),
  };

  // Agregar detalles solo si existen
  if (details) {
    response.details = details;
  }

  // En desarrollo, agregar información adicional
  if (process.env.NODE_ENV === 'development') {
    response.debug = {
      originalError: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
  }

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Wrapper para API handlers con manejo de errores automático
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error);
    }
  };
}

/**
 * Helper para validar autenticación
 */
export function requireAuth(userId: string | null): string {
  if (!userId) {
    throw new UnauthorizedError('Debe estar autenticado');
  }
  return userId;
}

/**
 * Helper para validar roles
 */
export function requireRole(userRole: string, requiredRole: string | string[]): void {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (!roles.includes(userRole)) {
    throw new ForbiddenError(`Se requiere rol: ${roles.join(' o ')}`);
  }
}

/**
 * Helper para validar owner/admin access
 */
export function requireOwnerOrAdmin(userId: string, resourceUserId: string, userRole: string): void {
  if (userId !== resourceUserId && userRole !== 'ADMIN') {
    throw new ForbiddenError('Solo el propietario o un administrador puede realizar esta acción');
  }
}