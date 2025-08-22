# Guía de Contribución - SorykPass

¡Gracias por tu interés en contribuir a SorykPass! Esta guía te ayudará a entender cómo participar en el desarrollo del proyecto.

## 🚀 Comenzando

### Prerrequisitos
- Node.js 18+
- PostgreSQL
- Git
- Editor de código (recomendamos VS Code)

### Configuración del entorno de desarrollo

1. **Fork y clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/soryck-access.git
cd soryck-access
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

4. **Configurar base de datos**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

## 📋 Proceso de Contribución

### 1. Reportar Issues
- Usa los templates de issue disponibles
- Proporciona información detallada y pasos para reproducir
- Incluye capturas de pantalla si es relevante

### 2. Proponer Features
- Abre un issue con el template "Feature Request"
- Describe claramente el problema que resuelve
- Proporciona ejemplos de uso
- Espera feedback antes de implementar

### 3. Enviar Pull Requests

#### Nomenclatura de ramas
```
feature/nombre-descriptivo
bugfix/descripcion-del-bug
hotfix/arreglo-urgente
docs/actualizacion-documentacion
```

#### Proceso
1. Crear rama desde `main`
2. Hacer commits descriptivos
3. Ejecutar tests y linting
4. Abrir PR con descripción detallada
5. Responder a feedback de revisión

## 🎨 Estándares de Código

### TypeScript
- Usar tipado estricto
- Evitar `any`, preferir tipos específicos
- Documentar interfaces complejas

### React/Next.js
- Componentes funcionales con hooks
- Usar Server Components cuando sea posible
- Implementar error boundaries

### Estilos
- Usar Tailwind CSS para estilos
- Mantener consistencia con el design system
- Optimizar para responsive design

### Naming Conventions
```typescript
// Componentes en PascalCase
const EventCard = () => {}

// Variables y funciones en camelCase
const eventData = {}
const handleSubmit = () => {}

// Constantes en UPPER_SNAKE_CASE
const API_ENDPOINTS = {}

// Archivos en kebab-case
event-card.tsx
promo-codes-management.tsx
```

## 🧪 Testing

### Ejecutar tests
```bash
npm run test          # Todos los tests
npm run test:watch    # Modo watch
npm run test:coverage # Con coverage
```

### Escribir tests
- Tests unitarios para utilidades
- Tests de integración para APIs
- Tests de componentes con React Testing Library

### Ejemplo de test
```typescript
import { render, screen } from '@testing-library/react'
import EventCard from './EventCard'

describe('EventCard', () => {
  it('renders event information correctly', () => {
    const mockEvent = {
      title: 'Test Event',
      date: '2024-01-01',
      price: 10000
    }
    
    render(<EventCard event={mockEvent} />)
    
    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(screen.getByText('$10.000')).toBeInTheDocument()
  })
})
```

## 🗃️ Base de Datos

### Migraciones
```bash
# Crear nueva migración
npx prisma migrate dev --name descripcion-cambio

# Aplicar migraciones
npx prisma migrate deploy
```

### Schema Changes
- Siempre crear migraciones para cambios de schema
- Considerar compatibilidad hacia atrás
- Documentar breaking changes

## 📁 Estructura de Archivos

### Componentes
```
src/components/
├── ui/              # Componentes base (buttons, inputs, etc.)
├── forms/           # Formularios específicos
├── layouts/         # Layouts de página
└── features/        # Componentes por feature
```

### Hooks
```
src/hooks/
├── useAuth.ts       # Hook de autenticación
├── useEvents.ts     # Hook para eventos
└── useApi.ts        # Hook genérico para API
```

### Utilidades
```
src/lib/
├── auth.ts          # Utilidades de autenticación
├── db.ts            # Cliente de base de datos
├── validations.ts   # Schemas de validación
└── utils.ts         # Utilidades generales
```

## 🚦 Git Workflow

### Commits
Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar sistema de códigos promocionales
fix: corregir validación de fechas
docs: actualizar README con nuevas features
style: mejorar diseño de cards de eventos
refactor: optimizar queries de base de datos
test: agregar tests para API de pagos
```

### Pull Request Template
```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

## Testing
- [ ] Tests pasando
- [ ] Tests agregados/actualizados
- [ ] Testing manual realizado

## Checklist
- [ ] Código sigue los estándares del proyecto
- [ ] Self-review realizado
- [ ] Documentación actualizada
- [ ] No hay conflictos de merge
```

## 🔍 Proceso de Review

### Para Reviewers
- Revisar funcionalidad y lógica
- Verificar estándares de código
- Probar cambios localmente
- Dar feedback constructivo

### Para Contributors
- Responder a comentarios
- Hacer cambios solicitados
- Mantener commits organizados
- Ser receptivo al feedback

## 🐛 Debugging

### Herramientas útiles
```bash
# Logs de Next.js
npm run dev

# Inspeccionar base de datos
npx prisma studio

# Debugging de API
curl -X POST http://localhost:3000/api/endpoint

# TypeScript check
npx tsc --noEmit
```

### Logging
```typescript
// Usar console.log para desarrollo
console.log('Debug info:', data)

// Para producción, usar un logger
import { logger } from '@/lib/logger'
logger.info('User action', { userId, action })
```

## 📚 Recursos Útiles

### Documentación
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Clerk Auth](https://clerk.com/docs)

### Herramientas
- [VS Code Extensions](https://code.visualstudio.com/docs/editor/extension-marketplace)
- [Prisma Studio](https://www.prisma.io/studio)
- [Postman](https://www.postman.com/) para testing de APIs

## ❓ Ayuda

Si necesitas ayuda:
1. Revisa la documentación existente
2. Busca en issues cerrados
3. Abre un nuevo issue con el template "Question"
4. Únete a nuestro Discord (si aplica)

## 🎉 Reconocimientos

Todos los contributors son listados en:
- README.md
- Página de agradecimientos
- Release notes

¡Gracias por contribuir a SorykPass! 🚀
