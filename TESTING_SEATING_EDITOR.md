# 🧪 Guía de Pruebas - Editor Visual de Asientos

**Fecha:** 1 de octubre de 2025
**Objetivo:** Verificar que el editor visual persiste correctamente los layouts

---

## ✅ Pre-requisitos

Asegúrate de que:
- ✅ La migración se ejecutó: `20251001183010_add_visual_coordinates_to_seating`
- ✅ No hay errores de TypeScript
- ✅ El servidor Next.js está corriendo (`npm run dev`)
- ✅ Tienes acceso como **ORGANIZER** o **ADMIN**

---

## 📋 Pasos de Prueba

### **Test 1: Crear Layout Visual Básico**

1. **Ir a la página de eventos:**
   - Navega a `/events/create`
   - Activa el switch "Este evento usa asientos numerados"
   - Completa los campos básicos (título, descripción, etc.)
   - Guarda el evento

2. **Abrir el editor de asientos:**
   - Desde el dashboard de eventos, encuentra tu evento
   - Haz clic en "Gestión de Asientos" o similar
   - Deberías ver el canvas SVG del `SeatingEditor`

3. **Crear una sección:**
   - En el panel izquierdo, ingresa:
     - Nombre: "Platea"
     - Selecciona un color (ej: azul)
   - Haz clic en "Agregar Sección"
   - Dibuja un rectángulo en el canvas arrastrando el mouse

4. **Agregar asientos a la sección:**
   - Con la sección seleccionada
   - Configura "Asientos deseados": 50
   - "Asientos por fila": 10
   - Haz clic en "Generar Asientos"

5. **Guardar:**
   - Haz clic en el botón "Guardar Plan de Asientos"
   - Deberías ver el mensaje "Guardando..." y luego "✅ Cambios guardados"

---

### **Test 2: Verificar Persistencia (CRÍTICO)**

6. **Recargar la página:**
   - Presiona `F5` o `Ctrl+R` (Windows) / `Cmd+R` (Mac)
   - **ESPERA a que cargue completamente**

7. **Verificar que el layout persiste:**
   - ✅ La sección "Platea" debe aparecer en la **misma posición**
   - ✅ Los asientos deben estar en las **mismas coordenadas**
   - ✅ El color y nombre deben mantenerse
   - ✅ El zoom y pan funcionan correctamente

**❌ Si el layout NO aparece o está en (0,0):**
- Abre la consola del navegador (`F12`)
- Busca errores relacionados con `/api/events/[id]/seating`
- Verifica que la respuesta incluya los campos `x`, `y`, `width`, `height`

---

### **Test 3: Editar Layout Existente**

8. **Mover la sección:**
   - Selecciona la sección "Platea"
   - Arrástrala a una nueva posición
   - Redimensiona usando los handles de las esquinas
   - Rota usando la rueda del mouse (si implementado)

9. **Agregar segunda sección:**
   - Crea "VIP" con otro color
   - Posiciónala en otra parte del canvas
   - Genera 20 asientos

10. **Guardar cambios:**
    - Clic en "Guardar"
    - Recarga la página nuevamente
    - **Verifica que AMBAS secciones mantienen sus posiciones**

---

### **Test 4: Probar Vista de Cliente**

11. **Ver evento como cliente:**
    - Cierra sesión o abre modo incógnito
    - Ve al evento público (URL: `/events/[id]`)
    - Haz clic en "Compra con Selección de Asientos"

12. **Verificar mapa de asientos:**
    - ✅ Deberías ver el mismo layout visual
    - ✅ Las secciones "Platea" y "VIP" en las posiciones correctas
    - ✅ Los asientos deben ser clickeables
    - ✅ Al seleccionar asientos, deben cambiar de color

---

## 🔍 Verificación Técnica (Opcional)

### **Verificar en Base de Datos:**

Abre tu cliente PostgreSQL (pgAdmin, DBeaver, etc.) y ejecuta:

```sql
-- Ver secciones con coordenadas
SELECT 
  id, 
  name, 
  x, 
  y, 
  width, 
  height, 
  rotation,
  "eventId"
FROM sections
WHERE "eventId" = 'TU_EVENT_ID_AQUI';

-- Ver asientos con posiciones
SELECT 
  s.id,
  s.row,
  s.number,
  s.x,
  s.y,
  sec.name AS section_name
FROM event_seats s
JOIN sections sec ON s."sectionId" = sec.id
WHERE sec."eventId" = 'TU_EVENT_ID_AQUI'
LIMIT 10;
```

**Resultado esperado:**
- ✅ Las columnas `x`, `y`, `width`, `height`, `rotation` deben tener valores numéricos (no NULL)
- ✅ Los asientos deben tener `x`, `y` con valores decimales

---

### **Verificar Respuesta de API:**

Abre DevTools del navegador (`F12`) → Pestaña "Network":

1. Recarga la página del editor
2. Busca la petición a `/api/events/[id]/seating`
3. Click derecho → "Copy Response"
4. Pega en un editor JSON

**Estructura esperada:**
```json
{
  "eventId": "evt_xxx",
  "hasSeatingPlan": true,
  "sections": [
    {
      "id": "sec_xxx",
      "name": "Platea",
      "color": "#0053CC",
      "basePrice": 10000,
      "x": 150.5,        // ✅ Debe existir
      "y": 200.3,        // ✅ Debe existir
      "width": 400,      // ✅ Debe existir
      "height": 300,     // ✅ Debe existir
      "rotation": 0,     // ✅ Debe existir
      "seats": [
        {
          "id": "seat_xxx",
          "row": "A",
          "number": "1",
          "x": 10.5,      // ✅ Debe existir
          "y": 15.2,      // ✅ Debe existir
          "status": "AVAILABLE"
        }
      ]
    }
  ]
}
```

---

## ❌ Problemas Comunes y Soluciones

### **Problema 1: Layout no persiste al recargar**

**Síntomas:**
- Las secciones aparecen en (0,0) o no aparecen
- El canvas está vacío después de recargar

**Solución:**
```bash
# Verificar que la migración se aplicó
npx prisma migrate status

# Si no está aplicada, ejecutar:
npx prisma migrate dev

# Regenerar el cliente Prisma
npx prisma generate
```

---

### **Problema 2: Error "Cannot read property 'x' of null"**

**Causa:** El endpoint GET no está retornando las coordenadas

**Verificar:**
```typescript
// En src/app/api/events/[id]/seating/route.ts
// Asegúrate de que el GET incluye:
x: section.x,
y: section.y,
width: section.width,
height: section.height,
rotation: section.rotation,
```

---

### **Problema 3: Asientos sin posición visual**

**Síntomas:**
- Las secciones se ven bien pero los asientos no aparecen

**Verificar:**
```typescript
// En el mismo endpoint GET:
seats: section.seats.map(seat => ({
  // ...
  x: seat.x,  // ✅ Debe estar
  y: seat.y,  // ✅ Debe estar
}))
```

---

## 📊 Criterios de Éxito

Marca cada uno al completar:

- [ ] ✅ Puedo crear secciones y posicionarlas libremente
- [ ] ✅ Puedo generar asientos dentro de las secciones
- [ ] ✅ Al guardar, veo el mensaje de confirmación
- [ ] ✅ Al recargar, el layout mantiene EXACTAMENTE las mismas posiciones
- [ ] ✅ Puedo editar secciones existentes (mover, redimensionar)
- [ ] ✅ Los cambios editados también persisten al recargar
- [ ] ✅ Como cliente, veo el mapa de asientos correcto
- [ ] ✅ Puedo seleccionar asientos en el mapa de cliente
- [ ] ✅ Las coordenadas están en la base de datos (verificación SQL)
- [ ] ✅ La API retorna coordenadas en la respuesta (verificación DevTools)

---

## 🎉 ¡Prueba Exitosa!

Si todos los criterios están marcados, el editor visual está funcionando correctamente. 

**Siguiente paso:** Continuar con **Fase 2** del roadmap:
- Implementar envío de emails con tickets
- Crear cron job para limpiar reservas expiradas
- Agregar más funcionalidades al sistema de seating

---

## 📞 Reportar Problemas

Si encuentras algún problema durante las pruebas:

1. **Captura de pantalla** del error en consola
2. **Pasos exactos** para reproducir el problema
3. **Request/Response** de la API (desde DevTools)
4. **Resultado de la query SQL** (si aplica)

Incluye esta información al reportar el bug.
