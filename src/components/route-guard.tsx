'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole } from '@prisma/client'
import { useRequireRole } from '@/hooks/use-roles'
import { Loader2, ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface RouteGuardProps {
  children: ReactNode
  requiredRole: UserRole
  fallback?: ReactNode
  redirectTo?: string
}

export function RouteGuard({ 
  children, 
  requiredRole, 
  fallback,
  redirectTo = '/unauthorized'
}: RouteGuardProps) {
  const router = useRouter()
  const { hasAccess, loading, shouldRedirect } = useRequireRole(requiredRole)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (shouldRedirect) {
    router.push(`${redirectTo}?required=${requiredRole.toLowerCase()}`)
    return null
  }

  if (!hasAccess && fallback) {
    return <>{fallback}</>
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <ShieldX className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground mb-6">
            No tienes permisos suficientes para acceder a esta página.
          </p>
          <Button asChild>
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function OrganizerGuard({ children, ...props }: Omit<RouteGuardProps, 'requiredRole'>) {
  return (
    <RouteGuard requiredRole={UserRole.ORGANIZER} {...props}>
      {children}
    </RouteGuard>
  )
}

export function AdminGuard({ children, ...props }: Omit<RouteGuardProps, 'requiredRole'>) {
  return (
    <RouteGuard requiredRole={UserRole.ADMIN} {...props}>
      {children}
    </RouteGuard>
  )
}