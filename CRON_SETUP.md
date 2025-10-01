# 🕒 Configuración de Cron Jobs

Este documento explica cómo configurar y utilizar los cron jobs del sistema.

---

## 📋 Cron Jobs Disponibles

### 1. Limpieza de Reservas Expiradas

**Endpoint:** `/api/cron/cleanup-reservations`  
**Frecuencia:** Cada 30 minutos  
**Propósito:** Eliminar reservas de asientos expiradas y cancelar órdenes pendientes antiguas

**Acciones que realiza:**
- ✅ Elimina reservas de asientos con `expiresAt < NOW()`
- ✅ Cancela órdenes en estado `PENDING` con más de 24 horas de antigüedad
- ✅ Registra logs detallados de la operación
- ✅ Retorna estadísticas de limpieza

**Configuración en `vercel.json`:**
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-reservations",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

---

## 🔐 Seguridad

### Configurar CRON_SECRET en Vercel

Los cron jobs están protegidos con un token de autorización. Para configurarlo:

#### 1. Generar un token seguro

```bash
# En terminal, genera un token aleatorio:
openssl rand -base64 32
```

O usa este comando en PowerShell:
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

#### 2. Agregar a variables de entorno en Vercel

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Click en **Settings** → **Environment Variables**
3. Agrega una nueva variable:
   - **Name:** `CRON_SECRET`
   - **Value:** El token generado en el paso 1
   - **Environments:** Production, Preview, Development

4. Click en **Save**

#### 3. Re-desplegar (opcional)

Si ya tienes deployments activos, considera hacer un nuevo deploy para que la variable tome efecto:

```bash
git commit --allow-empty -m "chore: trigger redeploy for CRON_SECRET"
git push
```

---

## 🧪 Probar el Cron Job Localmente

### Opción 1: Llamada HTTP directa

```bash
# Sin CRON_SECRET (desarrollo local)
curl http://localhost:3000/api/cron/cleanup-reservations

# Con CRON_SECRET
curl -H "Authorization: Bearer TU_CRON_SECRET_AQUI" \
  http://localhost:3000/api/cron/cleanup-reservations
```

### Opción 2: Usar Postman/Insomnia

1. **Method:** GET
2. **URL:** `http://localhost:3000/api/cron/cleanup-reservations`
3. **Headers:**
   - `Authorization: Bearer TU_CRON_SECRET_AQUI`

### Respuesta esperada

```json
{
  "success": true,
  "deletedReservations": 5,
  "cancelledOrders": 2,
  "timestamp": "2025-10-01T18:30:00.000Z"
}
```

---

## 📊 Monitoreo

### Ver logs en Vercel

1. Ve a tu proyecto en Vercel
2. Click en **Deployments** → Selecciona el deployment actual
3. Click en **Functions** → Busca `/api/cron/cleanup-reservations`
4. Click en el nombre de la función para ver logs

### Logs en consola

El cron job genera logs con el prefijo `[CRON-CLEANUP]`:

```
[CRON-CLEANUP] Iniciando limpieza de reservas expiradas...
[CRON-CLEANUP] Eliminadas 5 reservas expiradas
[CRON-CLEANUP] Canceladas 2 órdenes pendientes antiguas
```

---

## 🐛 Troubleshooting

### Problema: "No autorizado" (401)

**Causa:** El `CRON_SECRET` no está configurado o es incorrecto.

**Solución:**
1. Verifica que la variable de entorno existe en Vercel
2. Asegúrate de que el header `Authorization` tiene el formato correcto: `Bearer TOKEN`
3. Re-despliega si acabas de agregar la variable

### Problema: "Error al limpiar reservas" (500)

**Causa:** Error en la base de datos o en la lógica de limpieza.

**Solución:**
1. Revisa los logs en Vercel para ver el error específico
2. Verifica que la conexión a la base de datos funciona
3. Comprueba que el modelo `SeatReservation` existe en Prisma

### Problema: El cron no se ejecuta

**Causa:** La configuración en `vercel.json` puede estar incorrecta.

**Solución:**
1. Verifica que `vercel.json` tiene la sección `crons` correctamente
2. Asegúrate de que el proyecto está en un plan que soporte cron jobs (Hobby o superior)
3. Re-despliega el proyecto: `git push`

---

## 📅 Sintaxis de Schedule (Cron Expression)

La expresión `*/30 * * * *` significa "cada 30 minutos".

**Formato:** `minutos horas día-mes mes día-semana`

**Ejemplos:**
- `*/30 * * * *` - Cada 30 minutos
- `0 * * * *` - Cada hora (minuto 0)
- `0 0 * * *` - Todos los días a medianoche
- `0 */6 * * *` - Cada 6 horas
- `0 2 * * *` - Todos los días a las 2:00 AM

**Nota:** Vercel usa UTC timezone para cron jobs.

---

## 🔄 Próximos Pasos (Opcional)

### Ideas para mejorar el cron job:

1. **Notificaciones:** Enviar email a admins si se eliminan muchas reservas (posible problema)
2. **Métricas:** Guardar estadísticas de limpieza en base de datos
3. **Alertas:** Integrar con Sentry/DataDog si hay errores recurrentes
4. **Dashboard:** Crear página admin para ver historial de ejecuciones

---

## 📝 Checklist de Configuración

- [ ] `CRON_SECRET` agregado a variables de entorno en Vercel
- [ ] `vercel.json` actualizado con la configuración de cron
- [ ] Proyecto re-desplegado después de agregar la variable
- [ ] Cron job probado localmente
- [ ] Logs verificados en Vercel después del primer execution
- [ ] Documentación revisada por el equipo

---

**Última actualización:** 1 de octubre de 2025  
**Autor:** Sistema de Seating - Fase 2
