import { NextRequest, NextResponse } from 'next/server'
import { webpayPlus } from '@/lib/transbank'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount = 1000, testType = 'approve' } = body

    const timestamp = Date.now()
    const buyOrder = `TEST-${testType.toUpperCase()}-${timestamp}`
    const sessionId = `session-${testType}-${timestamp}`
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/transbank/return`

    console.log('🧪 Generando token de prueba:', {
      testType,
      buyOrder,
      sessionId,
      amount,
      returnUrl
    })

    const response = await webpayPlus.create(
      buyOrder,
      sessionId,
      amount,
      returnUrl
    )

    console.log('✅ Token generado exitosamente:', response.token)

    
    const cardData = testType === 'reject' ? {
      number: '5186 1741 1062 9480', 
      cvv: '123',
      month: '11',
      year: '23',
      result: 'SERÁ RECHAZADA ❌'
    } : {
      number: '4051 8860 0005 6590', 
      cvv: '123', 
      month: '11',
      year: '23',
      result: 'SERÁ APROBADA ✅'
    }

    return NextResponse.json({
      success: true,
      token: response.token,
      paymentUrl: response.url,
      testData: {
        buyOrder,
        sessionId,
        amount,
        testType
      },
      instructions: {
        step1: `🎫 TOKEN PARA FORMULARIO TRANSBANK: ${response.token}`,
        step2: `Ve a: ${response.url}`,
        step3: 'Usa esta tarjeta de prueba:',
        cardData,
        step4: 'Selecciona: Crédito, Sin cuotas',
        step5: `Resultado esperado: ${cardData.result}`
      },
      forTransbankForm: {
        token: response.token,
        instructions: [
          '1. Copia el token de arriba',
          '2. Pégalo en el formulario de certificación de Transbank',
          '3. La transacción debe cumplir: Crédito + Sin cuotas + ' + (testType === 'reject' ? 'Rechazada' : 'Aprobada')
        ]
      }
    })

  } catch (error) {
    console.error('❌ Error generando token:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      troubleshooting: [
        'Verifica la configuración de Transbank',
        'Asegúrate de que NEXT_PUBLIC_APP_URL esté configurado',
        'Revisa que transbank-sdk esté instalado correctamente'
      ]
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Generador de tokens de prueba para Transbank',
    usage: {
      endpoint: '/api/test/generate-token',
      method: 'POST',
      body: {
        amount: 1000, 
        testType: 'approve' 
      }
    },
    examples: [
      {
        description: 'Token para transacción APROBADA',
        request: 'POST /api/test/generate-token',
        body: { testType: 'approve', amount: 1000 }
      },
      {
        description: 'Token para transacción RECHAZADA', 
        request: 'POST /api/test/generate-token',
        body: { testType: 'reject', amount: 1000 }
      }
    ]
  })
}