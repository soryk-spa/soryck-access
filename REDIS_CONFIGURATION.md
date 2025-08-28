# Configuración de Redis para SorykPass

## 🔧 Variables de Entorno

Para configurar Redis en tu aplicación, necesitas establecer las siguientes variables de entorno en tu archivo `.env`:

### **Configuración Básica**

```env
# Redis Configuration
REDIS_HOST=localhost                    # Host del servidor Redis
REDIS_PORT=6379                        # Puerto de Redis (por defecto 6379)
REDIS_PASSWORD=                        # Contraseña (opcional para desarrollo)
REDIS_DB=0                            # Base de datos (0-15, por defecto 0)
```

### **Configuración Avanzada (Opcional)**

```env
# Para conexiones SSL/TLS
REDIS_TLS=true                         # Habilitar TLS
REDIS_URL=redis://username:password@host:port/db  # URL completa de conexión
```

## 🌍 Configuración por Entorno

### **Desarrollo Local**

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### **Producción (Ejemplo con Railway)**

```env
REDIS_HOST=redis.railway.app
REDIS_PORT=6379
REDIS_PASSWORD=tu_password_super_seguro
REDIS_DB=0
```

### **Producción (Ejemplo con Upstash)**

```env
REDIS_URL=rediss://default:password@host:port
```

### **Producción (Ejemplo con Redis Cloud)**

```env
REDIS_HOST=redis-12345.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=tu_password_de_redis_cloud
REDIS_DB=0
```

## 🔒 Seguridad

### **Recomendaciones de Seguridad:**

1. **Nunca uses contraseñas vacías en producción**
2. **Usa contraseñas fuertes** (al menos 32 caracteres)
3. **Configura firewall** para limitar acceso
4. **Usa TLS/SSL** en conexiones remotas
5. **Separa bases de datos** por entorno

### **Ejemplo de Contraseña Segura:**

```env
REDIS_PASSWORD=A9k2Xm8nP4vL7qR3sW6tY1uE5hG9jN2bC4fD8gK0m
```

## 📊 Panel de Administración

### **Acceso al Panel**

1. Ve a `/admin/redis` en tu aplicación
2. Solo usuarios con rol `ADMIN` pueden acceder
3. El panel muestra:
   - Estado de conexión en tiempo real
   - Configuración actual de Redis
   - Herramientas de gestión de caché
   - Métricas de rendimiento

### **Funciones del Panel:**

- ✅ **Monitor de salud**: Estado de conexión cada 30 segundos
- 🔧 **Configuración**: Visualiza host, puerto, DB, autenticación
- 🗑️ **Invalidación de caché**: Por categorías o completo
- 📈 **Métricas**: Rendimiento y estadísticas de uso

## 🚀 Servicios de Redis Recomendados

### **Para Desarrollo:**
- **Redis local**: Instala con `install-redis.ps1`
- **Docker**: `docker run -d -p 6379:6379 redis:latest`

### **Para Producción:**

1. **Upstash** (Recomendado - Serverless)
   - URL: https://upstash.com/
   - Perfecto para aplicaciones Next.js
   - Plan gratuito disponible

2. **Railway**
   - URL: https://railway.app/
   - Fácil configuración
   - Variables de entorno automáticas

3. **Redis Cloud**
   - URL: https://redislabs.com/
   - Servicio oficial de Redis
   - Alta disponibilidad

4. **AWS ElastiCache**
   - Para aplicaciones empresariales
   - Integración con AWS

## 🔧 Configuración Paso a Paso

### **Opción 1: Upstash (Recomendado)**

1. Crea cuenta en https://upstash.com/
2. Crea una nueva base de datos Redis
3. Copia la URL de conexión
4. Agrega a tu `.env`:
   ```env
   REDIS_URL=rediss://default:password@host:port
   ```

### **Opción 2: Railway**

1. Crea cuenta en https://railway.app/
2. Despliega un servicio Redis
3. Copia las variables de entorno
4. Agrega a tu `.env`:
   ```env
   REDIS_HOST=containers-us-west-xxx.railway.app
   REDIS_PORT=6379
   REDIS_PASSWORD=tu_password_de_railway
   REDIS_DB=0
   ```

### **Opción 3: Redis Local**

1. Ejecuta `install-redis.ps1` como administrador
2. O instala manualmente desde https://redis.io/download
3. Configura en `.env`:
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_DB=0
   ```

## 🧪 Verificación de Configuración

### **Verificar desde el código:**

```typescript
import { cache } from '@/lib/redis';

// Health check
const isHealthy = await cache.ping();
console.log('Redis healthy:', isHealthy);
```

### **Verificar desde el panel:**

1. Ve a `/admin/redis`
2. Revisa el estado de conexión
3. Verifica la configuración mostrada
4. Prueba invalidar caché

### **Verificar desde terminal:**

```bash
# Si tienes redis-cli instalado
redis-cli -h tu_host -p tu_puerto ping
```

## ❗ Solución de Problemas

### **Error: "Redis connection failed"**

1. **Verifica variables de entorno**:
   ```bash
   echo $REDIS_HOST
   echo $REDIS_PORT
   ```

2. **Verifica conectividad**:
   - Firewall
   - DNS
   - Credenciales

3. **Verifica logs**:
   - Revisa la consola del servidor
   - Ve a `/api/health/redis`

### **Error: "Authentication failed"**

1. Verifica `REDIS_PASSWORD`
2. Algunos servicios requieren usuario + contraseña
3. Revisa formato de URL si usas `REDIS_URL`

### **Error: "Connection timeout"**

1. Verifica que el host sea accesible
2. Revisa configuración de red/firewall
3. Prueba con `redis-cli` si está disponible

## 📝 Notas Importantes

- **Redis almacena datos en memoria**: Monitorea el uso de RAM
- **TTL automático**: Los datos expiran automáticamente
- **Fallback graceful**: La app funciona sin Redis (con menor rendimiento)
- **Invalidación automática**: El caché se actualiza cuando cambian los datos

## 🎯 Próximos Pasos

1. **Configura Redis en producción**
2. **Monitorea métricas de rendimiento**
3. **Ajusta TTL según necesidades**
4. **Configura alertas de monitoreo**
