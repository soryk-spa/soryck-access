"use client"
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  AlertTriangle
} from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string | null
  createdAt: string
  _count: {
    events: number
  }
}

interface CategoriesManagementProps {
  initialCategories: Category[]
}

export default function CategoriesManagement({ initialCategories }: CategoriesManagementProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [loading, setLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: ''
  })
  const [formErrors, setFormErrors] = useState<string[]>([])

  const nameInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setFormData({ name: '' })
    setFormErrors([])
  }

  const handleSubmit = async () => {
    setLoading(true)
    setFormErrors([])

    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          type DetailError = { message: string }
          setFormErrors(data.details.map((err: DetailError) => err.message))
        } else {
          setFormErrors([data.error || 'Error al procesar la solicitud'])
        }
        return
      }
      if (editingCategory) {
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? { ...cat, ...data.category } : cat
        ))
        setEditingCategory(null)
      } else {
        setCategories([...categories, { ...data.category, _count: { events: 0 } }])
        setIsCreateOpen(false)
      }

      resetForm()
    } catch (error) {
      console.error('Error:', error)
      setFormErrors(['Error de conexión'])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return
    }

    setDeletingId(id)

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Error al eliminar la categoría')
        return
      }

      setCategories(categories.filter(cat => cat.id !== id))
    } catch (error) {
      console.error('Error:', error)
      alert('Error de conexión')
    } finally {
      setDeletingId(null)
    }
  }

  const CategoryForm = () => (
    <div className="space-y-4">
      {formErrors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Por favor corrige los siguientes errores:</span>
          </div>
          <ul className="mt-2 text-sm text-destructive">
            {formErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <Label htmlFor="name">Nombre de la categoría *</Label>
        <Input
          ref={nameInputRef}
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ name: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder="Ej: Conciertos, Conferencias, Deportes, Cultura..."
          autoFocus
        />
        <p className="text-xs text-muted-foreground mt-1">
          Usa nombres simples y descriptivos que los usuarios puedan entender fácilmente
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {editingCategory ? 'Actualizar' : 'Crear'} Categoría
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            resetForm()
            setEditingCategory(null)
            setIsCreateOpen(false)
          }}
        >
          Cancelar
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Categorías</h2>
          <p className="text-muted-foreground">
            Administra las categorías de eventos disponibles en la plataforma
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm()
              setEditingCategory(null)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Categoría</DialogTitle>
            </DialogHeader>
            <CategoryForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <Badge variant="secondary">
                  {category._count.events} eventos
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex gap-2">
                <Dialog open={editingCategory?.id === category.id} onOpenChange={(open) => {
                  if (!open) {
                    setEditingCategory(null)
                    resetForm()
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Categoría</DialogTitle>
                    </DialogHeader>
                    <CategoryForm />
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  disabled={deletingId === category.id || category._count.events > 0}
                  className="text-destructive hover:text-destructive"
                >
                  {deletingId === category.id ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-1" />
                  )}
                  Eliminar
                </Button>
              </div>

              {category._count.events > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  No se puede eliminar porque tiene eventos asociados
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No hay categorías</h3>
            <p className="text-muted-foreground mb-4">
              Crea la primera categoría para empezar a organizar los eventos
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Categoría
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}