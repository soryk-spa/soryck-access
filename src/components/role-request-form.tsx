'use client'

import { useState } from 'react'
import { UserRole } from '@prisma/client'
import { useRoles } from '@/hooks/use-roles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/roles'
import { Mail, Send, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function RoleRequestForm() {
  const { user, isClient } = useRoles()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!user || !isClient) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      toast.error('Por favor describe por qué quieres ser organizador')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/user/request-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestedRole: UserRole.ORGANIZER,
          message: message.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Error al enviar solicitud')
      }

      setSubmitted(true)
      toast.success('Solicitud enviada exitosamente')
    } catch (error) {
      console.error('Error submitting role request:', error)
      toast.error('Error al enviar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Solicitud Enviada
            </h3>
            <p className="text-muted-foreground">
              Tu solicitud para convertirte en organizador ha sido enviada. 
              Te contactaremos pronto con una respuesta.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Solicitar Rol de Organizador
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Rol actual:</span>
            <Badge className={ROLE_COLORS[user.role]}>
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <span className="text-sm font-medium">Rol solicitado:</span>
            <Badge className={ROLE_COLORS[UserRole.ORGANIZER]}>
              {ROLE_LABELS[UserRole.ORGANIZER]}
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="message">
                ¿Por qué quieres ser organizador de eventos?
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe tu experiencia organizando eventos, tus planes, o cualquier información relevante..."
                className="mt-2 min-h-[120px]"
                required
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Como organizador podrás:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Crear y gestionar eventos</li>
                <li>• Vender tickets para tus eventos</li>
                <li>• Acceder a estadísticas de ventas</li>
                <li>• Gestionar participantes</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              disabled={loading || !message.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Solicitud
                </>
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}