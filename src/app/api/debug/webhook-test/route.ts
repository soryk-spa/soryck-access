import { NextResponse } from 'next/server';

export async function GET() {
  const webhookSecret = !!process.env.CLERK_WEBHOOK_SECRET;
  
  return NextResponse.json({
    status: 'webhook endpoint accessible',
    timestamp: new Date().toISOString(),
    webhookSecretConfigured: webhookSecret,
    environment: process.env.NODE_ENV
  });
}

export async function POST() {
  console.log('Debug webhook test endpoint called with POST');
  return NextResponse.json({
    status: 'POST received',
    timestamp: new Date().toISOString()
  });
}