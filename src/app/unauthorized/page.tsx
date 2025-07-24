import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldX, ArrowLeft, Mail } from 'lucide-react'

export default function UnauthorizedPage({
  searchParams,
}: {
  searchParams: { required?: string }
}) {
  const requiredRole = searchParams.required

  const getRoleMessage = () => {
    switch (requiredRole) {
      case 'organizer':
        return {
          title: 'Acceso de Organizador Requerido',
          message: 'Esta página está disponible solo para organizadores de eventos y administradores.',
          suggestion: 'Si deseas convertirte en organizador, contacta a nuestro equipo.'
        }
      case 'admin':
        return {
          title: 'Acceso de Administrador Requerido',
          message: 'Esta página está disponible solo para administradores del sistema.',
          suggestion: 'Si crees que deberías tener acceso, contacta al administrador principal.'
        }
      default:
        return {
          title: 'Acceso Denegado',
          message: 'No tienes permisos suficientes para acceder a esta página.',
          suggestion: 'Verifica tus permisos o contacta al administrador.'
        }
    }
  }

  const { title, message, suggestion } = getRoleMessage()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <ShieldX className="w-12 h-12 text-destructive" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {title}
          </h1>
          
          <p className="text-muted-foreground mb-2">
            {message}
          </p>
          
          <p className="text-sm text-muted-foreground">
            {suggestion}
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/contact">
              <Mail className="w-4 h-4 mr-2" />
              Contactar Soporte
            </Link>
          </Button>
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>¿Necesitas ser organizador?</strong><br />
            Los organizadores pueden crear y gestionar eventos. 
            Contacta a nuestro equipo para solicitar permisos de organizador.
          </p>
        </div>
      </div>
    </div>
  )
}