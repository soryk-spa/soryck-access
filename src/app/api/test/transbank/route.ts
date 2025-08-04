import { NextResponse } from 'next/server'
import { webpayPlus } from '@/lib/transbank'

export async function GET() {
  try {
    console.log('=== TEST DE TRANSBANK ===')

    const testData = {
      buyOrder: `TEST-${Date.now()}`,
      sessionId: `session-${Date.now()}`,
      amount: 1000,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/transbank/return`
    }
    
    console.log('Datos de prueba:', testData)
    
    const response = await webpayPlus.create(
      testData.buyOrder,
      testData.sessionId,
      testData.amount,
      testData.returnUrl
    )
    
    console.log('Respuesta exitosa de Transbank:', response)
    
    return NextResponse.json({
      success: true,
      message: 'Transbank configurado correctamente',
      testData,
      response: {
        token: response.token,
        url: response.url
      },
      instructions: {
        step1: 'Ve a la URL proporcionada',
        step2: 'Usa estos datos de tarjeta de prueba:',
        cardData: {
          number: '4051885600446623',
          cvv: '123',
          year: '23',
          month: '11'
        },
        step3: 'Selecciona "Sin cuotas"',
        step4: 'Confirma el pago',
        step5: 'Copia el token para el formulario de Transbank'
      }
    })
    
  } catch (error) {
    console.error('Error en test de Transbank:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      troubleshooting: [
        'Verifica que NEXT_PUBLIC_APP_URL esté configurado correctamente',
        'Asegúrate de que transbank-sdk esté instalado: npm install transbank-sdk',
        'Revisa que no haya errores de red o conectividad',
        'Confirma que estás usando el entorno correcto (integration vs production)'
      ]
    }, { status: 500 })
  }
}