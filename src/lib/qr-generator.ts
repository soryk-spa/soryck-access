import QRCode from 'qrcode';


export async function generateQRCodeBase64(
  qrCode: string, 
  verificationUrl?: string
): Promise<string> {
  try {
    
    const qrContent = verificationUrl || qrCode;
    
    
    const qrCodeBuffer = await QRCode.toBuffer(qrContent, {
      errorCorrectionLevel: 'H', 
      type: 'png',
      margin: 2, 
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200, 
      scale: 8 
    });

    
    const base64 = qrCodeBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code base64:', error);
    throw new Error('Failed to generate QR code');
  }
}


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


export function validateBase64Image(base64Image: string): boolean {
  try {
    const regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
    return regex.test(base64Image);
  } catch {
    return false;
  }
}


export function getBase64ImageSize(base64Image: string): number {
  try {
    const base64Data = base64Image.split(',')[1];
    const sizeInBytes = Math.ceil(base64Data.length * 3/4);
    return Math.round(sizeInBytes / 1024);
  } catch {
    return 0;
  }
}


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
