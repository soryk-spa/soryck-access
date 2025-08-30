'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTheme } from 'next-themes'
import { 
  Plus, 
  Trash2, 
  Move, 
  Square, 
  Save,
  ZoomIn,
  ZoomOut
} from 'lucide-react'

interface Section {
  id: string
  name: string
  color: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  priceZone?: string
  seats: Seat[]
}

interface Seat {
  id: string
  row: string
  number: string
  x: number
  y: number
  status: 'AVAILABLE' | 'BLOCKED' | 'MAINTENANCE'
  isAccessible: boolean
}

interface SeatingEditorProps {
  initialSections?: Section[]
  onSave: (sections: Section[]) => void
}

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
]

const SEAT_SIZE = 20
const GRID_SIZE = 10

export function SeatingEditor({ initialSections = [], onSave }: SeatingEditorProps) {
  const { resolvedTheme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [tool, setTool] = useState<'select' | 'section' | 'seat'>('select')
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [newSectionColor, setNewSectionColor] = useState(COLORS[0])

  // Obtener colores adaptativos según el tema
  const getThemeColors = useCallback(() => {
    const isDark = resolvedTheme === 'dark'
    return {
      grid: isDark ? '#4b5563' : '#e5e7eb', // Más visible pero sutil
      text: isDark ? '#f9fafb' : '#111827',
      canvas: isDark ? '#111827' : '#ffffff', // Fondo más contrastado en dark
      border: isDark ? '#6b7280' : '#d1d5db',
      panelBg: isDark ? '#374151' : '#ffffff',
      selectedBg: isDark ? '#1e40af' : '#3b82f6',
      selectedBorder: isDark ? '#3b82f6' : '#1d4ed8'
    }
  }, [resolvedTheme])

  // Canvas drawing functions
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const colors = getThemeColors()
    ctx.strokeStyle = colors.grid
    ctx.lineWidth = 0.5 // Líneas más delgadas
    ctx.globalAlpha = 0.6 // Hacer el grid más sutil

    const gridSpacing = GRID_SIZE * scale
    const startX = -offset.x % gridSpacing
    const startY = -offset.y % gridSpacing

    for (let x = startX; x < canvas.width; x += gridSpacing) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    for (let y = startY; y < canvas.height; y += gridSpacing) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    ctx.globalAlpha = 1 // Restaurar opacidad
  }, [scale, offset, getThemeColors])

  const drawSection = useCallback((ctx: CanvasRenderingContext2D, section: Section) => {
    const colors = getThemeColors()
    const x = (section.x * scale) + offset.x
    const y = (section.y * scale) + offset.y
    const width = section.width * scale
    const height = section.height * scale

    ctx.save()
    ctx.translate(x + width/2, y + height/2)
    ctx.rotate(section.rotation * Math.PI / 180)

    // Draw section rectangle
    const isSelected = selectedSection === section.id
    ctx.fillStyle = isSelected ? section.color + '60' : section.color + '30' // Más opacidad para mejor visibilidad
    ctx.strokeStyle = section.color
    ctx.lineWidth = isSelected ? 3 : 2
    ctx.fillRect(-width/2, -height/2, width, height)
    ctx.strokeRect(-width/2, -height/2, width, height)

    // Draw section name - usar color adaptativo con fondo para mejor legibilidad
    if (scale > 0.4) { // Solo mostrar nombre si hay suficiente zoom
      ctx.fillStyle = colors.canvas
      ctx.strokeStyle = colors.text
      ctx.lineWidth = 2
      const textY = -height/2 + 15 * scale
      
      // Fondo semi-transparente para el texto
      ctx.globalAlpha = 0.8
      ctx.fillRect(-width/3, textY - 8 * scale, (width * 2)/3, 16 * scale)
      ctx.globalAlpha = 1
      
      ctx.fillStyle = colors.text
      ctx.font = `bold ${Math.max(12 * scale, 10)}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(section.name, 0, textY)
    }

    // Draw seats
    section.seats.forEach(seat => {
      const seatX = (seat.x - section.width/2) * scale
      const seatY = (seat.y - section.height/2) * scale
      
      // Colores mejorados para asientos que se ven bien en ambos temas
      let seatColor = ''
      switch (seat.status) {
        case 'AVAILABLE':
          seatColor = '#22c55e' // Green-500 - se ve bien en ambos temas
          break
        case 'BLOCKED':
          seatColor = '#ef4444' // Red-500 - se ve bien en ambos temas
          break
        default:
          seatColor = '#f59e0b' // Amber-500 - se ve bien en ambos temas
          break
      }
      
      ctx.fillStyle = seatColor
      ctx.strokeStyle = colors.text
      ctx.lineWidth = 1.5
      
      if (seat.isAccessible) {
        // Draw wheelchair accessible seat (square)
        const seatSize = (SEAT_SIZE/2) * scale * 0.4
        ctx.fillRect(seatX - seatSize, seatY - seatSize, seatSize * 2, seatSize * 2)
        ctx.strokeRect(seatX - seatSize, seatY - seatSize, seatSize * 2, seatSize * 2)
      } else {
        // Draw regular seat (circle) - un poco más grande
        ctx.beginPath()
        ctx.arc(seatX, seatY, (SEAT_SIZE/2) * scale * 0.4, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
      }

      // Draw seat number - mejorado para mejor legibilidad
      if (scale > 0.5) { // Solo mostrar números si el zoom es suficiente
        ctx.fillStyle = colors.text
        ctx.font = `bold ${Math.max(8 * scale, 8)}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(seat.row + seat.number, seatX, seatY + 1)
      }
    })

    ctx.restore()
  }, [scale, offset, selectedSection, getThemeColors])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const colors = getThemeColors()

    // Clear canvas with theme-appropriate background
    ctx.fillStyle = colors.canvas
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    drawGrid(ctx, canvas)

    // Draw sections
    sections.forEach(section => drawSection(ctx, section))
  }, [sections, drawGrid, drawSection, getThemeColors])

  // Event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - offset.x) / scale
    const y = (e.clientY - rect.top - offset.y) / scale

    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle mouse or Alt+click for panning
      setIsPanning(true)
      setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y })
      return
    }

    if (tool === 'section') {
      setIsDrawing(true)
      setStartPos({ x, y })
    } else if (tool === 'select') {
      // Find clicked section
      const clickedSection = sections.find(section => 
        x >= section.x && x <= section.x + section.width &&
        y >= section.y && y <= section.y + section.height
      )
      setSelectedSection(clickedSection?.id || null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      })
      return
    }

    if (isDrawing && tool === 'section') {
      redraw()
      
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const rect = canvas.getBoundingClientRect()
      const currentX = (e.clientX - rect.left - offset.x) / scale
      const currentY = (e.clientY - rect.top - offset.y) / scale

      const width = Math.abs(currentX - startPos.x)
      const height = Math.abs(currentY - startPos.y)
      const x = Math.min(startPos.x, currentX)
      const y = Math.min(startPos.y, currentY)

      // Draw preview rectangle
      ctx.strokeStyle = newSectionColor
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(x * scale + offset.x, y * scale + offset.y, width * scale, height * scale)
      ctx.setLineDash([])
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false)
      return
    }

    if (isDrawing && tool === 'section') {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const currentX = (e.clientX - rect.left - offset.x) / scale
      const currentY = (e.clientY - rect.top - offset.y) / scale

      const width = Math.abs(currentX - startPos.x)
      const height = Math.abs(currentY - startPos.y)
      const x = Math.min(startPos.x, currentX)
      const y = Math.min(startPos.y, currentY)

      if (width > 50 && height > 50) { // Minimum size
        const newSection: Section = {
          id: Date.now().toString(),
          name: newSectionName || `Sección ${sections.length + 1}`,
          color: newSectionColor,
          x,
          y,
          width,
          height,
          rotation: 0,
          seats: []
        }

        setSections(prev => [...prev, newSection])
        setSelectedSection(newSection.id)
      }

      setIsDrawing(false)
    }
  }

  const generateSeatsForSection = (section: Section) => {
    const seats: Seat[] = []
    const rows = Math.floor(section.height / 40) // 40px between rows
    const seatsPerRow = Math.floor(section.width / 30) // 30px between seats

    for (let row = 0; row < rows; row++) {
      const rowLabel = String.fromCharCode(65 + row) // A, B, C...
      for (let seat = 0; seat < seatsPerRow; seat++) {
        seats.push({
          id: `${section.id}-${rowLabel}${seat + 1}`,
          row: rowLabel,
          number: (seat + 1).toString(),
          x: (seat + 1) * (section.width / (seatsPerRow + 1)),
          y: (row + 1) * (section.height / (rows + 1)),
          status: 'AVAILABLE',
          isAccessible: false
        })
      }
    }

    setSections(prev => prev.map(s => 
      s.id === section.id ? { ...s, seats } : s
    ))
  }

  const deleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId))
    if (selectedSection === sectionId) {
      setSelectedSection(null)
    }
  }

  const handleSave = async () => {
    try {
      await onSave(sections)
      alert('Configuración de asientos guardada exitosamente!')
    } catch (error) {
      console.error('Error saving seating plan:', error)
      alert('Error al guardar la configuración')
    }
  }

  useEffect(() => {
    redraw()
  }, [redraw])

  return (
    <div className="flex h-screen">
      {/* Toolbar */}
      <div className="w-80 bg-background border-r border-border p-4 overflow-y-auto">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Herramientas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={tool === 'select' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('select')}
              >
                <Move className="w-4 h-4" />
              </Button>
              <Button
                variant={tool === 'section' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('section')}
              >
                <Square className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setScale(prev => Math.min(prev * 1.2, 3))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setScale(prev => Math.max(prev / 1.2, 0.3))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {tool === 'section' && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Nueva Sección</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="section-name">Nombre</Label>
                <Input
                  id="section-name"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="Ej: Platea Alta"
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded border-2 ${
                        newSectionColor === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewSectionColor(color)}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sections List */}
        <Card>
          <CardHeader>
            <CardTitle>Secciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sections.map(section => (
                <div
                  key={section.id}
                  className={`p-3 rounded border cursor-pointer ${
                    selectedSection === section.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border'
                  }`}
                  onClick={() => setSelectedSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: section.color }}
                      />
                      <span className="font-medium">{section.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          generateSeatsForSection(section)
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSection(section.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {section.seats.length} asientos
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leyenda de colores */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Leyenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Asientos disponibles</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Asientos bloqueados</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Mantenimiento</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded border-2 border-muted-foreground"></div>
              <span>Accesible (♿)</span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 space-y-2">
          <Button onClick={handleSave} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Guardar Configuración
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          className="border border-border cursor-crosshair bg-background"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
        />
        
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm p-2 rounded border border-border shadow-md">
          <div className="text-sm text-foreground">
            <div>Zoom: {Math.round(scale * 100)}%</div>
            <div>Herramienta: {tool === 'select' ? 'Seleccionar' : 'Crear Sección'}</div>
            <div className="text-xs mt-1 text-muted-foreground">
              Clic medio o Alt+Clic para mover el lienzo
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
