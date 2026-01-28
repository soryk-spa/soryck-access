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
  RESEND_API_KEY: z.string().startsWith('re_', 'Resend API key inválida').optional(),

  // Redis (opcional)
  REDIS_URL: z.string().optional(),

  // UploadThing (opcional)
  UPLOADTHING_SECRET: z.string().optional(),
  UPLOADTHING_APP_ID: z.string().optional(),
  UPLOADTHING_TOKEN: z.string().optional(),

  // Admin emails (opcional)
  ADMIN_EMAILS: z.string().optional(),
  ORGANIZER_EMAILS: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

/**
 * Valida y parsea las variables de entorno
 * @throws {Error} Si hay variables faltantes o inválidas
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`);
      
      console.error('❌ Variables de entorno faltantes o inválidas:');
      missingVars.forEach((msg: string) => console.error(`  - ${msg}`));
      console.error('\n📄 Revisa el archivo .env.example para ver las variables requeridas');
      
      throw new Error(`Invalid environment variables: ${missingVars.join(', ')}`);
    }
    throw error;
  }
}

/**
 * Variables de entorno validadas y tipadas
 * Solo usar después de llamar validateEnv()
 */
export const env = validateEnv();

/**
 * Verifica si estamos en modo desarrollo
 */
export const isDev = env.NODE_ENV === 'development';

/**
 * Verifica si estamos en modo producción
 */
export const isProd = env.NODE_ENV === 'production';

/**
 * Verifica si estamos en modo test
 */
export const isTest = env.NODE_ENV === 'test';