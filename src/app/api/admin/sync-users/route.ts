import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { requireAdmin } from '@/lib/auth'
import { syncUserFromClerk } from '@/lib/sync-user'

export async function POST() {
  try {
    await requireAdmin()
    
    const client = await clerkClient()
    const clerkUsers = await client.users.getUserList()
    
    const syncResults = []
    
    for (const clerkUser of clerkUsers.data) {
      try {
        const syncedUser = await syncUserFromClerk(clerkUser.id)
        syncResults.push({
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          status: 'synced',
          role: syncedUser.role
        })
      } catch (error) {
        syncResults.push({
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          status: 'error',
          error: error instanceof Error ? error.message : 'Error desconocido'
        })
      }
    }

    return NextResponse.json({
      message: 'Sincronización completada',
      results: syncResults,
      totalProcessed: clerkUsers.data.length,
      successful: syncResults.filter(r => r.status === 'synced').length,
      errors: syncResults.filter(r => r.status === 'error').length
    })

  } catch (error) {
    console.error('Error in user sync:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}