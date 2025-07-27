import { clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function syncUserFromClerk(clerkId: string) {
  try {
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(clerkId)
    
    if (!clerkUser) {
      throw new Error('Usuario no encontrado en Clerk')
    }

    const existingUser = await prisma.user.findUnique({
      where: { clerkId }
    })

    if (existingUser) {
      return existingUser
    }

    let userRole: UserRole = UserRole.CLIENT
    
    if (clerkUser.publicMetadata && typeof clerkUser.publicMetadata === 'object' && 'role' in clerkUser.publicMetadata) {
      const metadataRole = clerkUser.publicMetadata.role as string
      if (Object.values(UserRole).includes(metadataRole as UserRole)) {
        userRole = metadataRole as UserRole
      }
    }

    const userCount = await prisma.user.count()
    if (userCount === 0) {
      userRole = UserRole.ADMIN
    }

    const organizerEmails = process.env.ORGANIZER_EMAILS?.split(',') || []
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress || ''
    
    if (adminEmails.includes(userEmail)) {
      userRole = UserRole.ADMIN
    } else if (organizerEmails.includes(userEmail)) {
      userRole = UserRole.ORGANIZER
    }

    const newUser = await prisma.user.create({
      data: {
        clerkId,
        email: userEmail,
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        imageUrl: clerkUser.imageUrl || '',
        role: userRole,
      },
    })

    console.log(`Usuario sincronizado: ${clerkId} con rol: ${userRole}`)
    return newUser

  } catch (error) {
    console.error('Error sincronizando usuario:', error)
    throw error
  }
}