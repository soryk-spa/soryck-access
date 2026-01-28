# 🚨 IMPORTANTE: Configuración de Base de Datos

## Archivos de Configuración

### `.env` (Producción)
- Contiene `DATABASE_URL` de **PRODUCCIÓN**
- Usado por Prisma en producción
- **NUNCA ejecutar seeders con este archivo**

### `.env.development` (Desarrollo)
- Contiene `DATABASE_URL` de **DESARROLLO**
- Debe apuntar a una base de datos local o de desarrollo
- Seguro para ejecutar seeders

### `.env.local` (Next.js Local)
- Variables para Next.js en desarrollo
- NO usado por Prisma CLI

## ⚠️ Ejecutar Seeders de Forma Segura

### Opción 1: Usar .env.development (RECOMENDADO)
```bash
# En desarrollo, usa .env.development
cp .env.development .env
node prisma/seed.js
# Después restaura .env de producción si es necesario
```

### Opción 2: Variable de entorno temporal
```bash
# Ejecutar con DATABASE_URL específica
DATABASE_URL="postgresql://user:pass@localhost:5432/dev_db" node prisma/seed.js
```

### Opción 3: Script seguro (por crear)
```bash
npm run seed:dev  # Solo funciona en desarrollo
```

## 🛡️ Protecciones Implementadas

Los seeders deben verificar:
1. ✅ Pedir confirmación antes de limpiar datos
2. ✅ Validar que NO estés en producción (hostname check)
3. ✅ Requerir variable de entorno `ALLOW_SEED=true`

## 📝 Recomendaciones

1. **NUNCA** ejecutes `node prisma/seed.js` sin verificar DATABASE_URL primero
2. Usa una base de datos local para desarrollo (PostgreSQL en Docker)
3. Crea snapshot de producción para importar en desarrollo si necesitas datos reales
4. Mantén `.env` con producción y `.env.development` con desarrollo por separado

## 🔍 Verificar Base de Datos Actual

```bash
# Ver a qué base de datos apunta actualmente
echo $DATABASE_URL
# O ver el archivo
cat .env | grep DATABASE_URL
```
