import QRCode from 'qrcode';

/**
 * Genera un código QR como imagen base64 para uso en emails
 * @param qrCode - El código QR a generar
 * @param verificationUrl - URL completa de verificación (opcional)
 * @returns Promise<string> - Data URL en formato base64
 */
export async function generateQRCodeBase64(
  qrCode: string, 
  verificationUrl?: string
): Promise<string> {
  try {
    // Usar la URL de verificación si se proporciona, sino el código directo
    const qrContent = verificationUrl || qrCode;
    
    // Configuración optimizada para emails
    const qrCodeBuffer = await QRCode.toBuffer(qrContent, {
      errorCorrectionLevel: 'H', // Alta corrección de errores
      type: 'png',
      margin: 2, // Margen para mejor legibilidad
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200, // Tamaño optimizado para email
      scale: 8 // Mayor escala para mejor calidad
    });

    // Convertir buffer a base64
    const base64 = qrCodeBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code base64:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Genera múltiples códigos QR como base64 para tickets
 * @param tickets - Array de objetos con qrCode
 * @param baseUrl - URL base para verificación
 * @returns Promise<Array> - Array de tickets con qrCodeImage base64
 */
export async function generateMultipleQRCodesBase64(
  tickets: Array<{ qrCode: string; [key: string]: unknown }>,
  baseUrl?: string
): Promise<Array<{ qrCode: string; qrCodeImage: string; [key: string]: unknown }>> {
  try {
    const ticketsWithImages = await Promise.all(
      tickets.map(async (ticket) => {
        const verificationUrl = baseUrl 
          ? `${baseUrl}/verify/${ticket.qrCode}`
          : undefined;
        
        const qrCodeImage = await generateQRCodeBase64(ticket.qrCode, verificationUrl);
        
        return {
          ...ticket,
          qrCodeImage
        };
      })
    );
    
    return ticketsWithImages;
  } catch (error) {
    console.error('Error generating multiple QR codes:', error);
    throw new Error('Failed to generate QR codes');
  }
}

/**
 * Valida que una imagen base64 sea válida
 * @param base64Image - Imagen en formato base64
 * @returns boolean - True si es válida
 */
export function validateBase64Image(base64Image: string): boolean {
  try {
    const regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
    return regex.test(base64Image);
  } catch {
    return false;
  }
}

/**
 * Obtiene el tamaño aproximado de una imagen base64 en KB
 * @param base64Image - Imagen en formato base64
 * @returns number - Tamaño en KB
 */
export function getBase64ImageSize(base64Image: string): number {
  try {
    const base64Data = base64Image.split(',')[1];
    const sizeInBytes = Math.ceil(base64Data.length * 3/4);
    return Math.round(sizeInBytes / 1024);
  } catch {
    return 0;
  }
}

// Configuraciones predefinidas para diferentes casos de uso
export const QRConfigs = {
  email: {
    errorCorrectionLevel: 'H' as const,
    width: 200,
    margin: 2,
    scale: 8,
  },
  print: {
    errorCorrectionLevel: 'H' as const,
    width: 400,
    margin: 4,
    scale: 10,
  },
  mobile: {
    errorCorrectionLevel: 'M' as const,
    width: 150,
    margin: 1,
    scale: 6,
  }
} as const;
