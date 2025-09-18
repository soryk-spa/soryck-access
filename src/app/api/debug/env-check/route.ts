import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    clerkPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    clerkSecretKey: !!process.env.CLERK_SECRET_KEY,
    clerkWebhookSecret: !!process.env.CLERK_WEBHOOK_SECRET,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}