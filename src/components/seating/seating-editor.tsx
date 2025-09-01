'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  '#0053CC', '#01CBFE', '#CC66CC', '#FE4F00', 
  '#FDBD00', '#10B981', '#8B5CF6', '#06B6D4'
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
    <div className="flex h-full bg-gradient-to-br from-[#0053CC]/5 via-[#01CBFE]/5 to-[#CC66CC]/5">
      <div className="w-80 bg-background/95 backdrop-blur-sm border-r shadow-lg p-4 overflow-y-auto">
        <Card className="mb-6 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-lg flex items-center justify-center">
                <Move className="w-4 h-4 text-white" />
              </div>
              Herramientas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={tool === 'select' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('select')}
                className={tool === 'select' 
                  ? "bg-gradient-to-r from-[#0053CC] to-[#01CBFE] text-white border-0" 
                  : "border-2 hover:border-[#0053CC] transition-colors"
                }
              >
                <Move className="w-4 h-4 mr-1" />
                Seleccionar
              </Button>
              <Button
                variant={tool === 'section' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('section')}
                className={tool === 'section' 
                  ? "bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] text-white border-0" 
                  : "border-2 hover:border-[#CC66CC] transition-colors"
                }
              >
                <Square className="w-4 h-4 mr-1" />
                Sección
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Control de zoom</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setScale(prev => Math.min(prev * 1.2, 3))}
                  className="flex-1 border-2 hover:border-[#01CBFE] transition-colors"
                >
                  <ZoomIn className="w-4 h-4 mr-1" />
                  Acercar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setScale(prev => Math.max(prev / 1.2, 0.3))}
                  className="flex-1 border-2 hover:border-[#FE4F00] transition-colors"
                >
                  <ZoomOut className="w-4 h-4 mr-1" />
                  Alejar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {tool === 'section' && (
          <Card className="mb-6 border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#CC66CC]/10 to-[#FE4F00]/10 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                Nueva Sección
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="section-name" className="text-sm font-medium">Nombre de la sección</Label>
                <Input
                  id="section-name"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="Ej: Platea Alta, VIP, General"
                  className="border-2 focus:border-[#CC66CC] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Color de la sección</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-xl border-2 transition-all hover:scale-105 ${
                        newSectionColor === color ? 'border-foreground shadow-lg' : 'border-muted-foreground/30'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewSectionColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  💡 Arrastra en el lienzo para crear la sección
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] rounded-lg flex items-center justify-center">
                <Square className="w-4 h-4 text-white" />
              </div>
              Secciones
              {sections.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {sections.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {sections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Square className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No hay secciones creadas</p>
                <p className="text-xs mt-1">Selecciona &quot;Sección&quot; y arrastra en el lienzo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map(section => (
                  <div
                    key={section.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedSection === section.id 
                        ? 'border-[#0053CC] bg-gradient-to-r from-[#0053CC]/10 to-[#01CBFE]/10 shadow-lg' 
                        : 'border-muted hover:border-[#0053CC]/50'
                    }`}
                    onClick={() => setSelectedSection(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-lg shadow-sm"
                          style={{ backgroundColor: section.color }}
                        />
                        <div>
                          <span className="font-semibold text-sm">{section.name}</span>
                          <p className="text-xs text-muted-foreground">
                            {section.seats.length} asientos
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            generateSeatsForSection(section)
                          }}
                          className="h-8 w-8 p-0 border-2 hover:border-green-500 hover:text-green-600"
                          title="Generar asientos"
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
                          className="h-8 w-8 p-0 border-2 hover:border-red-500 hover:text-red-600"
                          title="Eliminar sección"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-gradient-to-r from-[#01CBFE] to-[#CC66CC] rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              Leyenda de asientos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
              <span>Asientos disponibles</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
              <span>Asientos bloqueados</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-4 h-4 rounded-full bg-amber-500 shadow-sm"></div>
              <span>En mantenimiento</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-50"></div>
              <span>Accesible (♿)</span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-3">
          <Button 
            onClick={handleSave} 
            className="w-full bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90 text-white border-0 shadow-lg"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Configuración
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Los cambios se guardarán automáticamente
          </p>
        </div>
      </div>

      <div className="flex-1 relative bg-background">
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          className="border-0 cursor-crosshair bg-background shadow-inner"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
        />
        
        <div className="absolute top-6 left-6 bg-background/95 backdrop-blur-sm p-4 rounded-xl border-0 shadow-lg">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-full"></div>
              <span className="font-medium">Zoom: {Math.round(scale * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] rounded-full"></div>
              <span className="font-medium">
                Herramienta: {tool === 'select' ? 'Seleccionar' : 'Crear Sección'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-3 p-2 bg-muted/50 rounded">
              💡 Clic medio o Alt+Clic para mover el lienzo
            </div>
          </div>
        </div>

        {sections.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center space-y-4 p-8 bg-background/80 backdrop-blur-sm rounded-2xl border shadow-lg">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[#0053CC]/20 to-[#01CBFE]/20 rounded-2xl flex items-center justify-center">
                <Square className="w-8 h-8 text-[#0053CC]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Comienza a diseñar</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Selecciona la herramienta &quot;Sección&quot; y arrastra en el lienzo para crear tu primera sección de asientos
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
