# 🧪 Guía Rápida de Testing de Emails

## 🚀 Inicio Rápido (3 pasos)

### 1. Configurar Resend (1 minuto)

Ve a [resend.com/signup](https://resend.com/signup) y crea una cuenta gratuita.

En tu archivo `.env.local`:

```bash
RESEND_API_KEY=re_tu_api_key_aqui
EMAIL_FROM=onboarding@resend.dev
```

> 💡 `onboarding@resend.dev` es el email de prueba de Resend - funciona sin verificar dominio

### 2. Iniciar servidor (si no está corriendo)

```bash
npm run dev
```

### 3. Probar envío de email

**Opción A - Con script:**
```bash
node scripts/test-email.js tu-email@example.com
```

**Opción B - Con curl:**
```bash
curl -X POST http://localhost:3000/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email@example.com"}'
```

**Opción C - Desde el navegador:**
```javascript
// Abre la consola del navegador en http://localhost:3000 y ejecuta:
fetch('/api/test/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'tu-email@example.com' })
}).then(r => r.json()).then(console.log)
```

---

## 🎯 Qué hace el test

1. ✅ Genera un ticket con datos de prueba
2. ✅ Crea un QR code único
3. ✅ Genera el PDF del ticket (con el fix de fuentes)
4. ✅ Renderiza el email HTML con React Email
5. ✅ Envía el email con el PDF adjunto

---

## 🔍 Verificar configuración

```bash
curl http://localhost:3000/api/test/send-email
```

Respuesta esperada:
```json
{
  "status": "Email testing endpoint activo",
  "config": {
    "resendConfigured": true,
    "emailFrom": "onboarding@resend.dev",
    "nodeEnv": "development"
  }
}
```

---

## 🐛 Modo Debug (sin enviar emails reales)

Si no quieres gastar emails de prueba de Resend, usa el modo debug:

```bash
# .env.local
EMAIL_DEBUG=true
# RESEND_API_KEY=... (comentar esta línea)
```

En este modo:
- ✅ Los emails NO se envían
- ✅ El contenido se loguea en consola
- ✅ Los PDFs se generan igual (para verificar que funcionan)

---

## 📊 Ver emails enviados

### Resend Dashboard
1. Ve a [resend.com/emails](https://resend.com/emails)
2. Verás todos los emails enviados
3. Puedes ver el HTML renderizado
4. Puedes descargar los PDFs adjuntos

### Logs en Terminal
Busca en la consola del servidor:
```
📧 [Processing] Sending ticket email to: test@example.com
✅ [Sent] Email sent successfully: ticket to test@example.com
```

---

## ✅ Checklist de Testing

- [ ] Email llega a la bandeja de entrada
- [ ] Asunto es correcto: "🎫 Tu ticket para..."
- [ ] PDF adjunto se abre correctamente
- [ ] QR code es escaneable
- [ ] Datos del evento son correctos
- [ ] Información de asiento es legible
- [ ] Email se ve bien en móvil
- [ ] Links funcionan (si los hay)

---

## 🛠️ Troubleshooting

### Error: "RESEND_API_KEY no está definida"
**Solución:** Agrega tu API key a `.env.local`

### Error: "EMAIL_FROM no configurado"
**Solución:** Agrega `EMAIL_FROM=onboarding@resend.dev` a `.env.local`

### Error: "Connection refused"
**Solución:** Asegúrate que el servidor está corriendo con `npm run dev`

### Email no llega
**Solución:** 
1. Revisa la carpeta de spam
2. Verifica el dashboard de Resend
3. Usa el modo debug para ver logs

### PDF no se genera
**Solución:** Ya resuelto - el fix de fuentes está aplicado

---

## 🎓 Próximos pasos

Una vez que el test funciona:

1. **Configurar dominio propio** (opcional)
   - Ve a Resend → Domains
   - Agrega tu dominio (ej: sorykpass.com)
   - Configura los registros DNS
   - Cambia `EMAIL_FROM=tickets@sorykpass.com`

2. **Personalizar emails**
   - Edita `/src/app/api/_emails/ticket-email.tsx`
   - Agrega logo, colores, estilos
   - Mejora el diseño

3. **Producción**
   - Agrega `RESEND_API_KEY` y `EMAIL_FROM` en Vercel
   - Verifica que los emails se envíen correctamente
   - Monitorea en el dashboard de Resend

---

## 📞 Ayuda Rápida

```bash
# Ver configuración actual
curl http://localhost:3000/api/test/send-email

# Probar con tu email
node scripts/test-email.js tu-email@gmail.com

# Ver logs en tiempo real
# Los logs aparecen en la terminal donde corre npm run dev
```

**¿Listo para probar?** Ejecuta:
```bash
node scripts/test-email.js
```
