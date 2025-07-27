'use client'
import { useState } from 'react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/roles'
import { toast } from 'sonner'
import { UserRole } from '@prisma/client'

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: UserRole
  createdAt: Date
}

interface RoleManagementProps {
  users: User[]
  currentUserRole: UserRole
}

export function RoleManagement({ users, currentUserRole }: RoleManagementProps) {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (currentUserRole !== UserRole.ADMIN) {
      toast.error('Solo los administradores pueden cambiar roles')
      return
    }
    setLoadingUserId(userId) 
    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          role: newRole
        })
      })
      if (!response.ok) {
        throw new Error('Error al actualizar el rol')
      }
      toast.success('Rol actualizado exitosamente')
      window.location.reload()
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Error al actualizar el rol')
    } finally {
      setLoadingUserId(null)
    }
  }

  const getUserDisplayName = (user: User) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim()
    }
    return user.email
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Roles de Usuario</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium">
                  {getUserDisplayName(user)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {user.email}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Registrado: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Badge className={ROLE_COLORS[user.role]}>
                  {ROLE_LABELS[user.role]}
                </Badge>
                
                {currentUserRole === UserRole.ADMIN && (
                  <Select
                    value={user.role}
                    onValueChange={(newRole: UserRole) => 
                      handleRoleChange(user.id, newRole)
                    }
                    disabled={loadingUserId === user.id}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(UserRole).map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          ))}
          
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay usuarios registrados
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}