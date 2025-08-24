# Plan de Testing - SorykAccess

## 🎯 Estrategia de Testing

### 1. Tests Unitarios (Jest/Vitest) - CRÍTICO
```bash
# Instalar dependencias
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

#### Hooks Personalizados (100% cobertura)
- `usePromoCode.ts` → validaciones, filtros, estadísticas
- `useEventForm.ts` → validaciones de formulario, tipos de tickets
- `useTicketPurchase.ts` → lógica de compra, disponibilidad
- `usePayment.ts` → procesamiento de pagos

#### Utilidades (`/src/lib/utils.ts`)
- Formateo de precios y fechas
- Validaciones de email/URL
- Cálculos de comisiones
- Funciones de texto y arrays

#### Servicios
- `PromoCodeService` → validación de códigos
- Validaciones de QR
- Cálculos de comisiones

### 2. Tests de Integración - IMPORTANTE
```typescript
// API Routes Testing
describe('API /promo-codes', () => {
  test('POST /api/promo-codes crea código válido')
  test('GET /api/promo-codes/{id} retorna código existente')
  test('PATCH /api/promo-codes/{id} actualiza estado')
})

// Database Integration
describe('Prisma Operations', () => {
  test('Crear evento con tickets funciona correctamente')
  test('Validar códigos promocionales con restricciones')
  test('Procesar compra de tickets actualiza contadores')
})
```

### 3. Tests E2E (Playwright/Cypress) - MEDIO
```typescript
// User Journeys Críticos
test('Flujo completo de compra de tickets', async () => {
  // 1. Usuario ve evento público
  // 2. Selecciona tickets
  // 3. Aplica código promocional
  // 4. Completa pago con Transbank
  // 5. Recibe tickets por email
})

test('Organizador crea evento y gestiona códigos promocionales')
test('Scanner valida tickets en evento')
```

### 4. Tests de Performance - MEDIO
- Tiempo de carga de dashboard con 1000+ eventos
- Memoria usada en filtros complejos
- Performance de búsquedas en tiempo real

## 🚀 Implementación por Fases

### Fase 1: Setup Básico (1-2 días)
1. Configurar Jest/Vitest + Testing Library
2. Crear tests básicos para utils y hooks
3. Setup CI/CD básico con GitHub Actions

### Fase 2: Cobertura Core (3-5 días)
1. Tests completos de hooks personalizados
2. Tests de APIs críticas (pagos, códigos promo)
3. Tests de componentes principales

### Fase 3: E2E y Edge Cases (2-3 días)
1. Tests de flujos completos de usuario
2. Tests de casos extremos y errores
3. Tests de integración con Transbank

### Configuración Sugerida
```json
// jest.config.js
{
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
  "moduleNameMapping": {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```
