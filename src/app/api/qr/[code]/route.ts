import { NextRequest, NextResponse } from 'next/server'
import { validateQRCode } from '@/lib/qr'
import QRCode from 'qrcode'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    
    console.log(`[QR API] Solicitud para código: ${code}`)
    
    // Validar formato del código QR
    if (!validateQRCode(code)) {
      console.error('[QR API] Formato de código QR inválido:', code)
      return new NextResponse('Invalid QR code format', { status: 400 })
    }

    // URL de verificación
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${code}`
    
    console.log(`[QR API] Generando QR para: ${verificationUrl}`)
    
    // Generar QR como buffer con configuración optimizada para email
    const qrBuffer = await QRCode.toBuffer(verificationUrl, {
      errorCorrectionLevel: 'H', // Alta corrección de errores
      type: 'png',
      margin: 1, // Margen mínimo para email
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200, // Tamaño más pequeño para email
      scale: 8 // Mayor escala para mejor calidad
    })
    
    console.log(`[QR API] ✅ QR generado exitosamente, tamaño: ${qrBuffer.length} bytes`)
    
    const uint8Array = new Uint8Array(qrBuffer)
    
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 año
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Length': qrBuffer.length.toString(),
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('[QR API] ❌ Error generando código QR:', error)
    return new NextResponse('Error generating QR code', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      }
    })
  }
}