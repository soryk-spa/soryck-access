"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Loader2,
  AlertTriangle,
  Save,
} from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface CreateEventFormProps {
  categories: Category[]
}

export default function CreateEventForm({ categories }: CreateEventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    categoryId: '',
    capacity: 100,
    price: 0,
    isFree: false,
    imageUrl: ''
  })

  const combineDateTime = (date: string, time: string) => {
    if (!date) return ''
    if (!time) return `${date}T00:00:00`
    return `${date}T${time}:00`
  }

  const handleSubmit = async () => {
    setLoading(true)
    setFormErrors([])

    try {
      const startDateTime = combineDateTime(formData.startDate, formData.startTime)
      const endDateTime = formData.endDate ? combineDateTime(formData.endDate, formData.endTime) : undefined

      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        location: formData.location,
        startDate: startDateTime,
        endDate: endDateTime,
        categoryId: formData.categoryId,
        capacity: formData.capacity,
        price: formData.price,
        isFree: formData.isFree,
        imageUrl: formData.imageUrl || undefined
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      })

      const result = await response.json()

      interface ErrorDetail {
        message: string
        [key: string]: unknown
      }

      if (!response.ok) {
        if (result.details) {
          setFormErrors(result.details.map((err: ErrorDetail) => err.message))
        } else {
          setFormErrors([result.error || 'Error al crear el evento'])
        }
        return
      }
      router.push('/dashboard/events')
    } catch (error) {
      console.error('Error creating event:', error)
      setFormErrors(['Error de conexión'])
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (formData.price === 0) {
      setFormData(prev => ({ ...prev, isFree: true }))
    } else if (formData.price > 0) {
      setFormData(prev => ({ ...prev, isFree: false }))
    }
  }, [formData.price])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Crear Nuevo Evento
        </h1>
        <p className="text-muted-foreground">
          Completa la información de tu evento. Podrás editarlo después antes de publicarlo.
        </p>
      </div>
      {formErrors.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive text-sm mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Por favor corrige los siguientes errores:</span>
            </div>
            <ul className="text-sm text-destructive space-y-1">
              {formErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título del evento *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Concierto de Rock en Vivo"
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe tu evento, qué pueden esperar los asistentes..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length}/500 caracteres
              </p>
            </div>

            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="imageUrl">URL de imagen (opcional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación y Fechas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="location">Ubicación *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ej: Teatro Municipal, Valdivia"
                maxLength={200}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Fecha de inicio *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="startTime">Hora de inicio</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endDate">Fecha de fin (opcional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="endTime">Hora de fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  disabled={!formData.endDate}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Capacidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="capacity">Capacidad máxima *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="100000"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Número máximo de asistentes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Precio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="price">Precio por ticket (CLP) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                max="1000000"
                step="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.isFree ? '✅ Evento gratuito' : `💰 Precio: ${formData.price.toLocaleString('es-CL')} CLP`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.title || !formData.location || !formData.startDate || !formData.categoryId}
              size="lg"
              className="min-w-[200px]"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Crear Evento
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/events')}
              size="lg"
              className="min-w-[200px]"
            >
              Cancelar
            </Button>
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            El evento se creará como borrador. Podrás editarlo y publicarlo después.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}