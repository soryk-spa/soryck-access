# Instrucciones para usar gráficos con datos reales

## Cambios implementados

Se han creado los siguientes archivos para agregar valores reales a los gráficos:

### 1. APIs para estadísticas
- `src/app/api/dashboard/stats/route.ts` - API para estadísticas del usuario organizador
- `src/app/api/admin/dashboard/stats/route.ts` - API para estadísticas del admin

### 2. Hook personalizado
- `src/hooks/useDashboardStats.ts` - Hook para obtener datos de estadísticas

### 3. Componentes actualizados
- `src/components/user-dashboard-client.tsx` - Dashboard del usuario con datos reales
- `src/components/admin-dashboard-client.tsx` - Dashboard del admin actualizado para usar datos reales

### 4. Página de respaldo
- `src/app/dashboard/page-with-real-data.tsx` - Nueva página que usa el componente con datos reales

## Para activar los datos reales:

### Opción 1: Reemplazar el archivo existente
```bash
# Hacer respaldo del archivo actual
mv src/app/dashboard/page.tsx src/app/dashboard/page-original.tsx

# Usar la nueva versión con datos reales
mv src/app/dashboard/page-with-real-data.tsx src/app/dashboard/page.tsx
```

### Opción 2: Reemplazar manualmente el contenido
Copiar el contenido de `page-with-real-data.tsx` al archivo `page.tsx` existente.

## Características de los datos reales:

### Dashboard del Usuario:
- **Ingresos por mes**: Suma real de órdenes pagadas por mes
- **Eventos por mes**: Cantidad de eventos creados por mes  
- **Tickets por mes**: Cantidad de tickets vendidos por mes
- **Datos de los últimos 12 meses**

### Dashboard del Admin:
- **Ingresos totales de la plataforma** por mes
- **Usuarios registrados** por mes
- **Eventos creados en la plataforma** por mes
- **Estadísticas generales** de toda la plataforma

## Funcionalidades:

1. **Carga automática**: Los datos se cargan automáticamente al entrar al dashboard
2. **Estados de carga**: Muestra spinners mientras cargan los datos
3. **Manejo de errores**: Muestra mensajes de error si falla la carga
4. **Fallback**: Si no hay datos reales disponibles, muestra datos vacíos o por defecto
5. **Actualización**: Los datos se pueden refrescar usando la función `refetch`

## Notas importantes:

- Los datos se calculan en tiempo real desde la base de datos
- La API requiere autenticación con Clerk
- El admin dashboard requiere permisos de administrador
- Los gráficos mantienen el mismo diseño pero ahora muestran datos reales
- Los datos se agrupan por mes de los últimos 12 meses

## Troubleshooting:

Si hay problemas:
1. Verificar que las APIs respondan correctamente: `/api/dashboard/stats` y `/api/admin/dashboard/stats`
2. Verificar que el usuario tenga los permisos correctos
3. Revisar la consola del navegador para errores
4. Verificar que Prisma esté configurado correctamente
