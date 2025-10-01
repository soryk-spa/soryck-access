# 🔍 Análisis del Editor Visual de Venues - Problemas y Mejoras

**Fecha:** 1 de octubre de 2025
**Estado:** Revisión del sistema de asientos existente

---

## ❌ PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. **Desajuste Schema vs Editor (CRÍTICO)**

**Problema:**
El `SeatingEditor` usa campos de posicionamiento visual (`x`, `y`, `width`, `height`, `rotation`) que **NO existen** en el modelo `Section` de Prisma.

**Evidencia:**
```typescript
// SeatingEditor espera:
interface Section {
  id: string
  name: string
  color: string
  x: number        // ❌ NO EXISTE EN DB
  y: number        // ❌ NO EXISTE EN DB
  width: number    // ❌ NO EXISTE EN DB
  height: number   // ❌ NO EXISTE EN DB
  rotation: number // ❌ NO EXISTE EN DB
  seats: Seat[]
}

// Modelo Prisma real:
model Section {
  id          String
  name        String
  color       String
  basePrice   Float?
  seatCount   Int
  rowCount    Int
  seatsPerRow Int
  hasSeats    Boolean
  eventId     String
  seats       EventSeat[]
}
```

**Impacto:**
- ⚠️ El editor visual NO puede guardar las posiciones de las secciones
- ⚠️ Al recargar, las secciones pierden su posición visual
- ⚠️ El layout visual NO persiste en la base de datos

---

### 2. **Asientos sin Coordenadas Visuales**

**Problema:**
Los asientos individuales tampoco tienen campos `x`, `y` en el schema, pero el editor los necesita para mostrarlos en el mapa visual.

**Evidencia:**
```typescript
// EventSeat en Prisma:
model EventSeat {
  id          String
  row         String
  number      String
  displayName String?
  price       Float?
  status      SeatStatus
  // ❌ NO HAY x, y para posición visual
}

// SeatingEditor espera:
interface Seat {
  id: string
  row: string
  number: string
  x: number      // ❌ NO EXISTE
  y: number      // ❌ NO EXISTE
  status: string
  isAccessible: boolean
}
```

**Impacto:**
- El mapa visual de asientos no puede persistir
- Los usuarios no verán las posiciones reales al comprar

---

### 3. **API Endpoint No Guarda Datos Visuales**

**Problema:**
El endpoint `/api/events/[id]/seating` (POST) recibe secciones con coordenadas pero las descarta.

**Código actual:**
```typescript
// POST en seating/route.ts
await tx.section.create({
  data: {
    id: section.id,
    name: section.name,
    color: section.color,
    basePrice: section.basePrice,
    seatCount: section.seats?.length || 0,
    eventId
    // ❌ x, y, width, height, rotation se PIERDEN
  }
})
```

---

## 🔧 SOLUCIONES PROPUESTAS

### **Opción 1: Agregar Campos Visuales al Schema (RECOMENDADO)**

**Ventajas:**
✅ Persistencia completa del layout visual
✅ Búsquedas eficientes por coordenadas
✅ Validación de datos con Prisma

**Cambios necesarios:**

**1. Actualizar `prisma/schema.prisma`:**
```prisma
model Section {
  id          String   @id @default(cuid())
  name        String
  color       String   @default("#3B82F6")
  basePrice   Float?
  seatCount   Int      @default(0)
  rowCount    Int      @default(1)
  seatsPerRow Int      @default(1)
  hasSeats    Boolean  @default(true)
  description String?
  
  // ✅ Nuevos campos para editor visual
  x           Float?   // Posición X en canvas
  y           Float?   // Posición Y en canvas
  width       Float?   // Ancho en canvas
  height      Float?   // Alto en canvas
  rotation    Float?   @default(0) // Rotación en grados
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  seats       EventSeat[]

  @@map("sections")
}

model EventSeat {
  id           String     @id @default(cuid())
  row          String
  number       String
  displayName  String?
  price        Float?
  status       SeatStatus @default(AVAILABLE)
  isAccessible Boolean    @default(false)
  
  // ✅ Nuevos campos para posición visual
  x            Float?     // Posición X relativa a la sección
  y            Float?     // Posición Y relativa a la sección
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  sectionId    String
  section      Section    @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  tickets      Ticket[]
  reservations SeatReservation[]

  @@unique([sectionId, row, number])
  @@map("event_seats")
}
```

**2. Crear migración:**
```bash
npx prisma migrate dev --name add_visual_coordinates_to_seating
```

**3. Actualizar endpoint `/api/events/[id]/seating` (POST):**
```typescript
await tx.section.create({
  data: {
    id: section.id,
    name: section.name,
    color: section.color,
    basePrice: section.basePrice,
    seatCount: section.seats?.length || 0,
    // ✅ Guardar coordenadas visuales
    x: section.x,
    y: section.y,
    width: section.width,
    height: section.height,
    rotation: section.rotation,
    eventId
  }
})

// Al crear asientos:
await tx.eventSeat.createMany({
  data: section.seats.map((seat: SeatData) => ({
    id: seat.id,
    row: seat.row,
    number: seat.number,
    displayName: `${seat.row}${seat.number}`,
    price: seat.price,
    status: (seat.status as SeatStatus) || SeatStatus.AVAILABLE,
    isAccessible: seat.isAccessible || false,
    x: seat.x, // ✅ Posición visual
    y: seat.y, // ✅ Posición visual
    sectionId: createdSection.id
  }))
})
```

**4. Actualizar endpoint GET:**
```typescript
const sections = event.sections.map(section => ({
  id: section.id,
  name: section.name,
  color: section.color,
  basePrice: section.basePrice,
  // ✅ Incluir coordenadas visuales
  x: section.x,
  y: section.y,
  width: section.width,
  height: section.height,
  rotation: section.rotation,
  seats: section.seats.map(seat => ({
    id: seat.id,
    row: seat.row,
    number: seat.number,
    x: seat.x, // ✅ Coordenada visual
    y: seat.y, // ✅ Coordenada visual
    displayName: seat.displayName,
    price: seat.price,
    status: seat.reservations.length > 0 ? 'RESERVED' : seat.status,
    isAccessible: seat.isAccessible
  }))
}))
```

---

### **Opción 2: Usar Campo JSON para Layout (ALTERNATIVA)**

Si prefieres no agregar muchas columnas:

```prisma
model Section {
  // ... campos existentes
  visualLayout Json? // Guardar { x, y, width, height, rotation }
}

model EventSeat {
  // ... campos existentes
  visualPosition Json? // Guardar { x, y }
}
```

**Desventajas:**
- ❌ No se pueden hacer queries por coordenadas
- ❌ Menos validación de datos
- ❌ Más complejo de mantener

---

## 🐛 OTROS PROBLEMAS MENORES

### 4. **Falta Manejo de Elementos Visuales Extra**

El `SeatingEditor` soporta múltiples elementos:
- Escenarios (`Stage`)
- Formas decorativas (`Shape`, `Polygon`)
- Texto (`TextElement`)
- Entradas (`Entrance`)

Pero el endpoint **solo guarda secciones**, no estos elementos decorativos.

**Solución:**
Agregar campo `layoutElements` (JSON) al modelo `Venue` o `Event` para guardar elementos visuales adicionales.

---

### 5. **Venue y Event No Están Conectados Visualmente**

Actualmente:
- `Event` tiene `venueId` (opcional)
- `Venue` tiene `layoutElements` (JSON) y `layoutSections` (JSON)
- Pero NO hay sincronización automática

**Problema:**
Si un evento usa un venue, debería poder **copiar** el layout del venue como punto de partida.

**Solución propuesta:**
Endpoint: `POST /api/events/[id]/seating/from-venue`
- Copia las secciones del venue al evento
- Permite editar sin afectar el venue original

---

## ✅ RECOMENDACIÓN FINAL

**Implementar Opción 1** porque:
1. ✅ Es más robusto y escalable
2. ✅ Permite validaciones y queries eficientes
3. ✅ Mantiene consistencia de datos
4. ✅ Facilita debugging y mantenimiento

**Estimación:** 1-2 horas
- 30 min: Actualizar schema y crear migración
- 30 min: Actualizar endpoints GET/POST
- 30 min: Testing básico

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Decidir entre Opción 1 o 2
2. 🔄 Actualizar schema de Prisma
3. 🔄 Crear y ejecutar migración
4. 🔄 Actualizar endpoints API
5. 🔄 Probar editor visual end-to-end
6. ✅ Continuar con Fase 2 (emails, cron jobs)

