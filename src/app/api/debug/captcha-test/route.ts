import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar configuración de Clerk
    const clerkConfig = {
      publishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      publishableKeyValue: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + '...',
      secretKey: !!process.env.CLERK_SECRET_KEY,
      webhookSecret: !!process.env.CLERK_WEBHOOK_SECRET,
      environment: process.env.NODE_ENV,
      userAgent: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    };

    return NextResponse.json({
      status: 'Clerk configuration check',
      clerk: clerkConfig,
      cspHeaders: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      recommendations: {
        captcha: 'Verificar que los dominios de reCAPTCHA/hCaptcha estén en CSP',
        extensions: 'Desactivar extensiones del navegador temporalmente',
        browser: 'Probar en modo incógnito o navegador diferente'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}