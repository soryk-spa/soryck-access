import { NextRequest, NextResponse } from 'next/server'
import { sendTicketEmail } from '@/lib/email'
import { generateSimpleTicketPDF } from '@/lib/ticket-pdf-simple'
import QRCode from 'qrcode'

/**
 * Test endpoint para enviar emails de prueba con tickets
 * Solo disponible en desarrollo
 * 
 * Uso:
 * curl -X POST http://localhost:3000/api/test/send-email \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"tu-email@example.com"}'
 */
export async function POST(req: NextRequest) {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Este endpoint solo está disponible en desarrollo' },
      { status: 403 }
    )
  }

  try {
    const body = await req.json()
    const testEmail = body.email || 'test@example.com'

    console.log('📧 Enviando email de prueba a:', testEmail)

    // Datos de prueba para el ticket
    const testTicketData = {
      ticketId: 'TEST-' + Date.now(),
      qrCode: 'TEST-QR-' + Math.random().toString(36).substring(7),
      eventName: 'Concierto de Prueba',
      eventDate: '15 de febrero de 2026',
      eventTime: '20:00',
      venue: 'Teatro Municipal de Santiago',
      seatSection: 'VIP',
      seatRow: 'A',
      seatNumber: '15',
      price: 50000,
      buyerName: 'Usuario de Prueba',
      buyerEmail: testEmail,
    }

    // Generar QR code en base64
    const qrCodeImage = await QRCode.toDataURL(testTicketData.qrCode, {
      width: 300,
      margin: 2,
    })

    // Generar PDF del ticket
    const pdfBuffer = await generateSimpleTicketPDF({
      qrCode: testTicketData.qrCode,
      eventName: testTicketData.eventName,
      eventDate: testTicketData.eventDate,
      eventLocation: testTicketData.venue,
      orderNumber: 'TEST-ORDER-' + Date.now(),
      ticketNumber: 1,
      userName: testTicketData.buyerName,
      seatInfo: {
        sectionName: testTicketData.seatSection,
        row: testTicketData.seatRow,
        number: testTicketData.seatNumber,
      },
    })

    // Enviar email con el ticket
    console.log('📧 Intentando enviar email...')
    console.log('   De:', process.env.EMAIL_FROM)
    console.log('   Para:', testEmail)
    console.log('   RESEND_API_KEY configurada:', !!process.env.RESEND_API_KEY)
    
    const emailResult = await sendTicketEmail({
      userEmail: testEmail,
      userName: testTicketData.buyerName,
      eventTitle: testTicketData.eventName,
      eventDate: `${testTicketData.eventDate} a las ${testTicketData.eventTime}`,
      eventLocation: testTicketData.venue,
      orderNumber: 'TEST-ORDER-' + Date.now(),
      tickets: [
        {
          qrCode: testTicketData.qrCode,
          qrCodeImage,
          seatInfo: {
            sectionName: testTicketData.seatSection,
            row: testTicketData.seatRow,
            number: testTicketData.seatNumber,
          },
        },
      ],
    })
    
    console.log('✅ Email procesado')

    return NextResponse.json({
      success: true,
      message: `Email de prueba enviado a ${testEmail}`,
      details: {
        ticketId: testTicketData.ticketId,
        qrCode: testTicketData.qrCode,
        pdfSize: `${(pdfBuffer.length / 1024).toFixed(2)} KB`,
        emailFrom: process.env.EMAIL_FROM,
        resendConfigured: !!process.env.RESEND_API_KEY,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('❌ Error enviando email de prueba:', error)
    return NextResponse.json(
      {
        error: errorMessage,
        details: errorStack,
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint para verificar configuración
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Este endpoint solo está disponible en desarrollo' },
      { status: 403 }
    )
  }

  return NextResponse.json({
    status: 'Email testing endpoint activo',
    config: {
      resendConfigured: !!process.env.RESEND_API_KEY,
      emailFrom: process.env.EMAIL_FROM || 'No configurado',
      nodeEnv: process.env.NODE_ENV,
    },
    usage: {
      test: 'POST /api/test/send-email',
      body: { email: 'tu-email@example.com' },
      example:
        'curl -X POST http://localhost:3000/api/test/send-email -H "Content-Type: application/json" -d \'{"email":"test@example.com"}\'',
    },
  })
}
