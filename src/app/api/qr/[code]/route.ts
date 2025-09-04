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
    
    
    if (!validateQRCode(code)) {
      console.error('[QR API] Formato de código QR inválido:', code)
      return new NextResponse('Invalid QR code format', { status: 400 })
    }

    
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${code}`
    
    console.log(`[QR API] Generando QR para: ${verificationUrl}`)
    
    
    const qrBuffer = await QRCode.toBuffer(verificationUrl, {
      errorCorrectionLevel: 'H', 
      type: 'png',
      margin: 1, 
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200, 
      scale: 8 
    })
    
    console.log(`[QR API] ✅ QR generado exitosamente, tamaño: ${qrBuffer.length} bytes`)
    
    const uint8Array = new Uint8Array(qrBuffer)
    
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable', 
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