# 📧 Guía de Testing de Emails en Desarrollo

## Opción 1: Resend Test Mode (Recomendado)

### Configuración
1. Ve a [Resend](https://resend.com) y crea una cuenta (gratis)
2. En tu dashboard, ve a "API Keys"
3. Copia tu API key de test (empieza con `re_`)
4. Agrega a tu `.env.local`:

```bash
RESEND_API_KEY=re_tu_test_key_aqui
EMAIL_FROM=onboarding@resend.dev  # Email de test de Resend
```

### Beneficios
- ✅ Emails reales renderizados
- ✅ Ver el HTML en el dashboard de Resend
- ✅ No llegan a emails reales (van a test inbox)
- ✅ Gratis hasta 100 emails/día

### Uso
```bash
# Los emails se envían a la test inbox de Resend
# Puedes verlos en: https://resend.com/emails
```

---

## Opción 2: Mailtrap (Alternativa)

### Configuración
1. Crea cuenta en [Mailtrap](https://mailtrap.io) (gratis)
2. Copia las credenciales SMTP
3. Instala el paquete de Mailtrap:

```bash
npm install nodemailer @types/nodemailer
```

4. Configura en `.env.local`:

```bash
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=tu_usuario
MAILTRAP_PASS=tu_password
EMAIL_FROM=test@sorykpass.com
```

---

## Opción 3: Modo Local Mock (Sin envío real)

### Activar modo de desarrollo
En `.env.local`:

```bash
NODE_ENV=development
EMAIL_DEBUG=true
# No configures RESEND_API_KEY para usar el modo mock
```

### Qué hace
- Los emails NO se envían
- El contenido HTML se guarda en `/tmp/emails/`
- Se loguea en consola el contenido
- Los PDFs se guardan localmente

---

## Testing Manual

### Endpoint de Test
Crea un endpoint de prueba para enviar emails:

**Archivo:** `src/app/api/test/send-email/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { sendTicketEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    await sendTicketEmail({
      userEmail: body.email || 'test@example.com',
      userName: 'Usuario de Prueba',
      eventTitle: 'Concierto de Prueba 🎵',
      eventDate: '15 de febrero de 2026 a las 20:00',
      eventLocation: 'Teatro Municipal de Santiago',
      orderNumber: 'TEST-' + Date.now(),
      tickets: [
        {
          qrCode: 'TEST-QR-CODE-123',
          qrCodeImage: 'data:image/png;base64,test',
          seatInfo: {
            sectionName: 'VIP',
            row: 'A',
            number: '15'
          }
        }
      ]
    })

    return NextResponse.json({ success: true, message: 'Email enviado' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### Probar desde Terminal

```bash
# Con Resend configurado
curl -X POST http://localhost:3000/api/test/send-email \\
  -H "Content-Type: application/json" \\
  -d '{"email":"tu-email@example.com"}'

# Ver logs
npm run dev
```

---

## Herramientas Útiles

### 1. React Email Dev Server
Ver emails en tiempo real mientras desarrollas:

```bash
# Instalar
npm install -D @react-email/cli

# Ejecutar
npx email dev

# Abrir: http://localhost:3000
```

### 2. Ethereal Email (Temporal)
Para emails temporales sin registro:

```javascript
// En src/lib/email-test.ts
import nodemailer from 'nodemailer'

export async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount()
  
  console.log('🔗 Test Email Account:')
  console.log('   User:', testAccount.user)
  console.log('   Pass:', testAccount.pass)
  console.log('   Web:', 'https://ethereal.email')
  
  return testAccount
}
```

---

## Verificación de Emails

### Checklist
- [ ] Email se renderiza correctamente en Gmail
- [ ] Email se renderiza correctamente en Outlook
- [ ] Links funcionan correctamente
- [ ] PDFs adjuntos se abren sin problemas
- [ ] QR codes son escaneables
- [ ] Imágenes cargan correctamente
- [ ] Texto alternativo (alt) está presente
- [ ] Email responsive en móvil

### Herramientas de Testing
- [Litmus](https://litmus.com) - Test en múltiples clientes
- [Email on Acid](https://www.emailonacid.com) - Testing visual
- [Mail Tester](https://www.mail-tester.com) - Score de spam

---

## Troubleshooting

### Email no llega
1. Verifica que `RESEND_API_KEY` esté configurada
2. Verifica que `EMAIL_FROM` sea un dominio verificado
3. Revisa logs en consola: `logger.email.*`
4. Verifica la carpeta de spam

### PDF no se genera
1. Error ENOENT: Ya resuelto (fuentes)
2. Verificar que QRCode se genere correctamente
3. Revisar logs del generador de PDFs

### Email se ve mal
1. Usar React Email templates
2. Mantener estilos inline
3. Evitar CSS avanzado
4. Probar en múltiples clientes

---

## Recomendación Final

**Para desarrollo local rápido:**
```bash
# .env.local
RESEND_API_KEY=re_tu_test_key
EMAIL_FROM=onboarding@resend.dev
```

**Para producción:**
```bash
# .env (Vercel)
RESEND_API_KEY=re_tu_prod_key
EMAIL_FROM=tickets@sorykpass.com
```

Usa **Resend** - es la opción más simple y efectiva para Next.js.
