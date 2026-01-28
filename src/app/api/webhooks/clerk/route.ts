import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  console.log(`[webhook:${requestId}] incoming webhook headers: svix-id=${svix_id} svix-timestamp=${svix_timestamp}`);
  
  // Log webhook secret status (but not the actual value)
  const hasWebhookSecret = !!process.env.CLERK_WEBHOOK_SECRET;
  console.log(`[webhook:${requestId}] webhook secret configured: ${hasWebhookSecret}`);

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error(`[webhook:${requestId}] Missing svix headers - id:${!!svix_id} timestamp:${!!svix_timestamp} signature:${!!svix_signature}`);
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  const payload = await req.text()
  const payloadLength = payload.length;
  console.log(`[webhook:${requestId}] payload received, length: ${payloadLength}`);
  
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
    console.log(`[webhook:${requestId}] webhook verification successful`);
  } catch (err) {
    console.error(`[webhook:${requestId}] Error verifying webhook:`, err);
    console.error(`[webhook:${requestId}] Headers - ID: ${svix_id}, Timestamp: ${svix_timestamp}, Signature: ${svix_signature?.substring(0, 10)}...`);
    return new Response('Error occured', {
      status: 400
    })
  }
  
  const eventType = evt.type;

  console.log(`[webhook:${requestId}] verified event type=${eventType}`);

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;

    try {
      let userRole: UserRole = UserRole.CLIENT;
      
      if (public_metadata && typeof public_metadata === 'object' && 'role' in public_metadata) {
        const metadataRole = public_metadata.role as string;
        if (Object.values(UserRole).includes(metadataRole as UserRole)) {
          userRole = metadataRole as UserRole;
        }
      }

      const userCount = await prisma.user.count();
      if (userCount === 0) {
        userRole = UserRole.ADMIN;
      }

      const organizerEmails = process.env.ORGANIZER_EMAILS?.split(',') || [];
      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
      
      const userEmail = email_addresses[0]?.email_address || '';
      
      if (adminEmails.includes(userEmail)) {
        userRole = UserRole.ADMIN;
      } else if (organizerEmails.includes(userEmail)) {
        userRole = UserRole.ORGANIZER;
      }

      await prisma.user.create({
        data: {
          clerkId: id,
          email: userEmail,
          firstName: first_name || '',
          lastName: last_name || '',
          imageUrl: image_url || '',
          role: userRole,
        },
      });
      console.log(`[webhook:${requestId}] User created in database: ${id} with role: ${userRole}`);
    } catch (error) {
      console.error(`[webhook:${requestId}] Error creating user in database:`, error);
      return new Response('Error creating user', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;

    try {
      interface UserUpdateData {
        email: string;
        firstName: string;
        lastName: string;
        imageUrl: string;
        role?: UserRole;
      }

      const updateData: UserUpdateData = {
        email: email_addresses[0]?.email_address || '',
        firstName: first_name || '',
        lastName: last_name || '',
        imageUrl: image_url || '',
      };

      if (public_metadata && typeof public_metadata === 'object' && 'role' in public_metadata) {
        const metadataRole = public_metadata.role as string;
        if (Object.values(UserRole).includes(metadataRole as UserRole)) {
          updateData.role = metadataRole as UserRole;
        }
      }

      await prisma.user.update({
        where: { clerkId: id },
        data: updateData,
      });
      console.log(`[webhook:${requestId}] User updated in database: ${id}`);
    } catch (error) {
      console.error(`[webhook:${requestId}] Error updating user in database:`, error);
      return new Response('Error updating user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      await prisma.user.delete({
        where: { clerkId: id! },
      });
      console.log(`[webhook:${requestId}] User deleted from database: ${id}`);
    } catch (error) {
      console.error(`[webhook:${requestId}] Error deleting user from database:`, error);
      return new Response('Error deleting user', { status: 500 });
    }
  }

  return new Response('', { status: 200 })
}