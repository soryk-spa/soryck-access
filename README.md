# SorykPass - Plataforma de Gestión de Eventos

<div align="center">
  <img src="public/sorykpass_horizontal_black.png" alt="SorykPass Logo" width="300" />
  
  **La Puerta de Entrada al Presente**
  
  Una plataforma digital completa para la gestión de eventos, venta de tickets y control de acceso.
</div>

## 🚀 Características Principales

### 🎟️ **Gestión de Eventos**
- Creación y edición de eventos con información detallada
- Múltiples tipos de tickets por evento (General, VIP, etc.)
- Categorías de eventos personalizables
- Sistema de imágenes y multimedia

### 💰 **Sistema de Códigos Promocionales**
- Descuentos por porcentaje, monto fijo o acceso gratuito
- Códigos específicos por tipo de ticket
- Límites de uso totales y por usuario
- Fechas de validez personalizables
- Generación automática o códigos personalizados

### 🔐 **Control de Acceso**
- Códigos QR únicos para cada ticket
- Sistema de escaneo para verificación de entrada
- Roles diferenciados (Admin, Organizador, Scanner)
- Gestión de permisos por evento

### 💳 **Procesamiento de Pagos**
- Integración con Transbank (WebPay Plus)
- Soporte para múltiples métodos de pago
- Gestión de transacciones y reembolsos
- Reportes financieros detallados

### 👥 **Gestión de Usuarios**
- Autenticación segura con Clerk
- Roles y permisos granulares
- Perfiles de organizadores públicos
- Sistema de solicitudes de roles

## 🛠️ Stack Tecnológico

### **Frontend**
- **Next.js 15.4.3** - Framework React con App Router
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Framework CSS utilitario
- **Radix UI** - Componentes accesibles
- **Framer Motion** - Animaciones fluidas

### **Backend**
- **Next.js API Routes** - Endpoints del servidor
- **Prisma 6.12.0** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional
- **Zod** - Validación de esquemas

### **Autenticación y Seguridad**
- **Clerk** - Autenticación y gestión de usuarios
- **Middleware personalizado** - Control de acceso por rutas

### **Servicios Externos**
- **Transbank SDK** - Procesamiento de pagos
- **Resend** - Envío de emails
- **UploadThing** - Gestión de archivos
- **Sonner** - Notificaciones toast

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL
- Cuenta en Clerk
- Credenciales de Transbank (para pagos)

### 1. Clonar el repositorio
```bash
git clone https://github.com/soryk-spa/soryck-access.git
cd soryck-access
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear un archivo `.env.local` basado en `.env.example`:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/soryck_access"

# Clerk (Autenticación)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Webhooks
CLERK_WEBHOOK_SECRET=""

# Transbank (Pagos)
TRANSBANK_COMMERCE_CODE=""
TRANSBANK_API_KEY=""
TRANSBANK_ENVIRONMENT="INTEGRATION" # o "PRODUCTION"

# Resend (Emails)
RESEND_API_KEY=""

# UploadThing (Archivos)
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""

# Aplicación
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Configurar la base de datos
```bash
# Ejecutar migraciones
npx prisma migrate dev

# Generar el cliente Prisma
npx prisma generate

# (Opcional) Poblar con datos de ejemplo
npx prisma db seed
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   ├── admin/             # Panel de administración
│   ├── dashboard/         # Dashboard de organizadores
│   ├── events/            # Páginas públicas de eventos
│   └── ...
├── components/            # Componentes React reutilizables
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y configuraciones
└── middleware.ts          # Middleware de Next.js

prisma/
├── schema.prisma         # Esquema de base de datos
└── migrations/           # Migraciones de BD

public/                   # Archivos estáticos
```

## 🎯 Casos de Uso

### Para Organizadores de Eventos
1. **Crear eventos** con múltiples tipos de tickets
2. **Configurar códigos promocionales** específicos
3. **Gestionar ventas** y ver estadísticas
4. **Controlar acceso** con QR codes
5. **Generar reportes** financieros

### Para Administradores
1. **Gestionar usuarios** y asignar roles
2. **Supervisar eventos** de todos los organizadores
3. **Configurar categorías** del sistema
4. **Acceder a reportes** globales

### Para Compradores
1. **Explorar eventos** disponibles
2. **Comprar tickets** de forma segura
3. **Aplicar códigos promocionales**
4. **Recibir tickets** con QR codes
5. **Acceder a eventos** presentando QR

## 🔐 Roles y Permisos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **ADMIN** | Administrador del sistema | Acceso total |
| **ORGANIZER** | Organizador de eventos | Gestión de eventos propios |
| **SCANNER** | Personal de control de acceso | Escaneo de tickets |
| **USER** | Usuario registrado | Compra de tickets |

## 🚀 Deployment

### Vercel (Recomendado)
1. Conectar repositorio en Vercel
2. Configurar variables de entorno
3. Deploy automático

### Docker
```bash
# Construir imagen
docker build -t soryck-access .

# Ejecutar contenedor
docker run -p 3000:3000 soryck-access
```

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 📊 Scripts Disponibles

```bash
npm run dev          # Ejecutar en desarrollo
npm run build        # Construir para producción
npm run start        # Ejecutar build de producción
npm run lint         # Ejecutar ESLint
npm run type-check   # Verificar tipos TypeScript
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

## 📝 Changelog

### v1.2.0 (Actual)
- ✅ Sistema de códigos promocionales por tipo de ticket
- ✅ Mejoras en la gestión de eventos
- ✅ Integración completa de notificaciones toast
- ✅ Optimizaciones de UI/UX

### v1.1.0
- ✅ Sistema de códigos promocionales básico
- ✅ Gestión de roles y permisos
- ✅ Integración con Transbank

### v1.0.0
- ✅ Funcionalidades base de gestión de eventos
- ✅ Sistema de autenticación
- ✅ Generación de tickets con QR

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Equipo

**SorykPass Team**
- Desarrollado para la gestión eficiente de eventos digitales
- Enfoque en experiencia de usuario y escalabilidad

## 📞 Soporte

Para soporte técnico o consultas:
- 📧 Email: soporte@sorykpass.com
- 🌐 Website: [sorykpass.com](https://sorykpass.com)

---

<div align="center">
  <strong>SorykPass - La Puerta de Entrada al Presente</strong>
  <br>
  <em>Un sistema ágil, confiable y sin fricciones para eventos digitales</em>
</div>
