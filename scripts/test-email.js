#!/usr/bin/env node

/**
 * Script para probar el envío de emails localmente
 * 
 * Uso:
 *   node scripts/test-email.js tu-email@example.com
 * 
 * O sin argumentos para usar email de prueba:
 *   node scripts/test-email.js
 */

const testEmail = process.argv[2] || 'test@example.com';

console.log('🚀 Iniciando prueba de email...\n');

// Hacer request al endpoint de test
fetch('http://localhost:3000/api/test/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email: testEmail }),
})
  .then(async (res) => {
    const data = await res.json();
    
    if (res.ok) {
      console.log('✅ Email enviado exitosamente!\n');
      console.log('📧 Detalles:');
      console.log('   Email:', testEmail);
      console.log('   Ticket ID:', data.details.ticketId);
      console.log('   QR Code:', data.details.qrCode);
      console.log('   PDF Size:', data.details.pdfSize);
      console.log('\n💡 Revisa tu inbox o el dashboard de Resend');
    } else {
      console.error('❌ Error al enviar email:\n');
      console.error(data.error);
      if (data.details) {
        console.error('\nDetalles:');
        console.error(data.details);
      }
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Error de conexión:');
    console.error(error.message);
    console.error('\n💡 ¿Está el servidor corriendo? (npm run dev)');
    process.exit(1);
  });
