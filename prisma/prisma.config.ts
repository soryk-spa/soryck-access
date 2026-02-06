import { defineConfig } from '@prisma/client/config';

/**
 * Configuración de Prisma para v7+
 * En Prisma 7, la configuración del datasource se movió a este archivo
 * en lugar de estar en el schema.prisma
 */
export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
