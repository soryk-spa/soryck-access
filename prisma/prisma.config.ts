/**
 * Configuración de Prisma para v7+
 * En Prisma 7, la configuración del datasource se define aquí
 * en lugar de estar en el schema.prisma
 */
export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};
