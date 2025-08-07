import QRCode from "qrcode"

export interface TicketQRData {
  ticketId: string
  eventId: string
  userId: string
  eventTitle: string
  attendeeName: string
  attendeeEmail: string
  eventDate: string
  eventLocation: string
  qrCode: string
  timestamp: string
}

export async function generateTicketQR(ticketData: TicketQRData): Promise<string> {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${ticketData.qrCode}`
    
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    })
    
    return qrCodeDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Error al generar el código QR')
  }
}

export async function generateTicketQRAsBuffer(ticketData: TicketQRData): Promise<Buffer> {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${ticketData.qrCode}`
    
    const qrBuffer = await QRCode.toBuffer(verificationUrl, {
      errorCorrectionLevel: 'M',
      type: 'png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    })
    
    return qrBuffer
  } catch (error) {
    console.error('Error generating QR buffer:', error)
    throw new Error('Error al generar el código QR como buffer')
  }
}

export function generateUniqueQRCode(eventId: string, userId: string, timestamp: number, index: number = 0): string {
  const randomString = Math.random().toString(36).substring(2, 15)
  const timeString = timestamp.toString(36)
  const eventString = eventId.substring(0, 8)
  const userString = userId.substring(0, 8)
  
  return `${eventString}-${userString}-${timeString}-${randomString}-${index}`.toUpperCase()
}

export function validateQRCode(qrCode: string): boolean {
  const qrRegex = /^[A-Z0-9]{8}-[A-Z0-9]{8}-[A-Z0-9]+-[A-Z0-9]+-\d+$/
  return qrRegex.test(qrCode)
}