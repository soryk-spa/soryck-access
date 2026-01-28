import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar configuración de Clerk
    const clerkConfig = {
      publishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      publishableKeyValue: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      secretKey: !!process.env.CLERK_SECRET_KEY,
      webhookSecret: !!process.env.CLERK_WEBHOOK_SECRET,
      environment: process.env.NODE_ENV,
      signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
      signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
      afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
      afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    };

    return NextResponse.json({
      status: 'Clerk configuration check',
      clerk: clerkConfig,
      cspHeaders: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      troubleshooting: {
        step1: 'Verifica las herramientas del desarrollador (F12) en la pestaña Console',
        step2: 'Ve a la pestaña Network y busca requests fallidos',
        step3: 'Desactiva todas las extensiones del navegador',
        step4: 'Prueba en modo incógnito',
        step5: 'Prueba en un navegador diferente',
        step6: 'Verifica que no hay un firewall corporativo bloqueando',
        cspStatus: 'CSP temporalmente muy permisiva para debugging'
      },
      possibleCauses: [
        'Extensiones de navegador (AdBlockers, Privacy tools)',
        'Firewall corporativo/ISP bloqueando dominios',
        'Browser settings bloqueando third-party scripts', 
        'DNS issues con dominios de Clerk',
        'Clerk configuration issue en dashboard'
      ]
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}