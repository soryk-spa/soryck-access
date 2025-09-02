// Test script para verificar generación de QR
const QRCode = require('qrcode');

async function testQRGeneration() {
  try {
    console.log('🔍 Probando generación de QR...');
    
    const testCode = 'TEST-QR-CODE-123';
    const testUrl = `https://example.com/verify/${testCode}`;
    
    // Probar con la misma configuración que usamos en el código
    const qrBase64 = await QRCode.toDataURL(testUrl, {
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300,
      errorCorrectionLevel: 'M'
    });
    
    console.log('✅ QR generado exitosamente');
    console.log('📏 Tamaño del QR:', Math.ceil(qrBase64.length / 1024), 'KB');
    console.log('🔗 Comienza con:', qrBase64.substring(0, 50) + '...');
    console.log('🎯 Formato correcto:', qrBase64.startsWith('data:image/png;base64,'));
    
    // Verificar que no esté vacío
    if (qrBase64.length < 100) {
      console.error('❌ QR parece estar vacío o corrupto');
    } else {
      console.log('✅ QR tiene el tamaño esperado');
    }
    
    return qrBase64;
  } catch (error) {
    console.error('❌ Error generando QR:', error);
    return null;
  }
}

testQRGeneration().then(result => {
  if (result) {
    console.log('\n🎉 Test completado exitosamente');
  } else {
    console.log('\n💥 Test falló');
  }
});
