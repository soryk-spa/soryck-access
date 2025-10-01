import { z } from 'zod';

/**
 * Schema de validación para variables de entorno
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida'),

  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'Clerk publishable key inválida'),
  CLERK_SECRET_KEY: z.string().startsWith('sk_', 'Clerk secret key inválida'),
  CLERK_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'Clerk webhook secret inválido'),

  // Transbank
  TRANSBANK_ENVIRONMENT: z.enum(['production', 'integration']).default('integration'),
  TRANSBANK_COMMERCE_CODE: z.string().optional(),
  TRANSBANK_API_KEY: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL debe ser una URL válida'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Email (opcional)
  RESEND_API_KEY: z.string().optional(),

  // UploadThing (opcional)
  UPLOADTHING_SECRET: z.string().optional(),
  UPLOADTHING_APP_ID: z.string().optional(),

  // Redis (opcional)
  REDIS_URL: z.string().url().optional(),

  // Roles (opcional)
  ADMIN_EMAILS: z.string().optional(),
  ORGANIZER_EMAILS: z.string().optional(),

  // Debug (solo desarrollo)
  DEBUG_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Valida las variables de entorno al inicio
 */
export function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    
    // Validaciones adicionales para producción
    if (env.NODE_ENV === 'production') {
      if (env.TRANSBANK_ENVIRONMENT === 'production' && 
          (!env.TRANSBANK_COMMERCE_CODE || !env.TRANSBANK_API_KEY)) {
        throw new Error('TRANSBANK_COMMERCE_CODE y TRANSBANK_API_KEY son requeridos en producción');
      }
    }

    console.log('✅ Variables de entorno validadas correctamente');
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Error de validación de variables de entorno:');
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      });
    } else {
      console.error('❌ Error validando variables de entorno:', error);
    }
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Variables de entorno inválidas en producción');
    }
    
    console.warn('⚠️  Continuando en modo desarrollo con variables inválidas');
    return process.env as Env;
  }
}

// Exportar variables validadas
export const env = validateEnv();