import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  DollarSign, 
  Calendar,
  Tag
} from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface EventFilters {
  search: string
  categoryId: string
  location: string
  minPrice: string
  maxPrice: string
  dateFrom: string
  dateTo: string
  isFree: string
  sortBy: string
  sortOrder: string
}

interface EventsFiltersProps {
  categories: Category[]
  filters: EventFilters
  onFiltersChange: (filters: EventFilters) => void
  onClearFilters: () => void
  totalResults: number
}

export default function EventsFilters({ 
  categories, 
  filters, 
  onFiltersChange, 
  onClearFilters,
  totalResults 
}: EventsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof EventFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.categoryId) count++
    if (filters.location) count++
    if (filters.minPrice) count++
    if (filters.maxPrice) count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    if (filters.isFree && filters.isFree !== 'all') count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {totalResults} eventos encontrados
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Ocultar' : 'Mostrar'} filtros
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar eventos por título..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4" />
                Categoría
              </Label>
              <Select 
                value={filters.categoryId} 
                onValueChange={(value) => updateFilter('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4" />
                Ubicación
              </Label>
              <Input
                placeholder="Ciudad o lugar..."
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
              />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                Precio
              </Label>
              <Select 
                value={filters.isFree} 
                onValueChange={(value) => updateFilter('isFree', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los precios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los precios</SelectItem>
                  <SelectItem value="true">Solo gratuitos</SelectItem>
                  <SelectItem value="false">Solo pagados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm">Precio mín. (CLP)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm">Precio máx. (CLP)</Label>
                <Input
                  type="number"
                  placeholder="1000000"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                Desde
              </Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                Hasta
              </Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                min={filters.dateFrom || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
          <div className="flex-1">
            <Label className="text-sm mb-2 block">Ordenar por</Label>
            <Select 
              value={filters.sortBy} 
              onValueChange={(value) => updateFilter('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startDate">Fecha del evento</SelectItem>
                <SelectItem value="createdAt">Recién publicados</SelectItem>
                <SelectItem value="price">Precio</SelectItem>
                <SelectItem value="title">Nombre A-Z</SelectItem>
                <SelectItem value="capacity">Capacidad</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Label className="text-sm mb-2 block">Orden</Label>
            <Select 
              value={filters.sortOrder} 
              onValueChange={(value) => updateFilter('sortOrder', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">
                  {filters.sortBy === 'price' ? 'Menor a mayor' : 
                   filters.sortBy === 'title' ? 'A - Z' : 
                   filters.sortBy === 'startDate' ? 'Más próximos' :
                   'Ascendente'}
                </SelectItem>
                <SelectItem value="desc">
                  {filters.sortBy === 'price' ? 'Mayor a menor' : 
                   filters.sortBy === 'title' ? 'Z - A' : 
                   filters.sortBy === 'startDate' ? 'Más lejanos' :
                   'Descendente'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {activeFiltersCount > 0 && (
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}