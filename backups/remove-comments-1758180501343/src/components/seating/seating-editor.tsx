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
  ZoomOut,
  Circle,
  Type,
  DoorOpen,
  Theater,
  Shapes,
  Edit3,
  Check,
  X,
  Pentagon,
  Grid3X3,
  MousePointer,
  PanelLeftClose,
  PanelLeftOpen,
  FlipHorizontal,
  Undo,
  Redo,
  Copy,
  Clipboard,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Download,
  Upload,
  Hand
} from 'lucide-react'

export interface Section {
  id: string
  type: 'section'
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

interface PolygonSection {
  id: string
  type: 'polygonSection'
  name: string
  color: string
  points: { x: number; y: number }[]
  rotation: number
  priceZone?: string
  capacity?: number
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

interface Stage {
  id: string
  type: 'stage'
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  color: string
}

interface Shape {
  id: string
  type: 'rectangle' | 'circle'
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  color: string
  strokeColor: string
  strokeWidth: number
  filled: boolean
}

interface Polygon {
  id: string
  type: 'polygon'
  name: string
  points: { x: number; y: number }[]
  rotation: number
  color: string
  strokeColor: string
  strokeWidth: number
  filled: boolean
}

interface TextElement {
  id: string
  type: 'text'
  content: string
  x: number
  y: number
  fontSize: number
  color: string
  fontWeight: 'normal' | 'bold'
  rotation: number
}

interface Entrance {
  id: string
  type: 'entrance'
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  color: string
  entranceType: 'main' | 'emergency' | 'vip' | 'service'
}

export type VenueElement = Section | PolygonSection | Stage | Shape | TextElement | Entrance | Polygon

interface SeatingEditorProps {
  initialSections?: Section[]
  initialElements?: VenueElement[]
  onSave: (sections: Section[], elements?: VenueElement[]) => void
}

const COLORS = [
  '#0053CC', '#01CBFE', '#CC66CC', '#FE4F00', 
  '#FDBD00', '#10B981', '#8B5CF6', '#06B6D4'
]

const ENTRANCE_COLORS = {
  main: '#10B981',
  emergency: '#EF4444', 
  vip: '#8B5CF6',
  service: '#6B7280'
}

const SEAT_SIZE = 20
// const GRID_SIZE = 10

export function SeatingEditor({ initialSections = [], initialElements = [], onSave }: SeatingEditorProps) {
  const { resolvedTheme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [elements, setElements] = useState<VenueElement[]>(initialElements)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [tool, setTool] = useState<'select' | 'hand' | 'section' | 'polygonSection' | 'seat' | 'stage' | 'rectangle' | 'circle' | 'text' | 'entrance' | 'polygon'>('select')
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [newSectionColor, setNewSectionColor] = useState(COLORS[0])
  
  
  const [isEditingInPlace, setIsEditingInPlace] = useState(false)
  const [editingText, setEditingText] = useState('') // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null)
  const [showGrid, setShowGrid] = useState(false)
  const [snapToGrid, setSnapToGrid] = useState(true) // eslint-disable-line @typescript-eslint/no-unused-vars
  const [gridSize, setGridSize] = useState(20) // eslint-disable-line @typescript-eslint/no-unused-vars
  
  
  const [creationMode, setCreationMode] = useState<'manual' | 'bySeats'>('manual')
  const [desiredSeats, setDesiredSeats] = useState(50)
  const [seatsPerRow, setSeatsPerRow] = useState(10)
  const [seatSpacing, setSeatSpacing] = useState(35) 
  const [rowSpacing, setRowSpacing] = useState(40) 
  
  
  const [isCreatingPolygon, setIsCreatingPolygon] = useState(false)
  const [polygonPoints, setPolygonPoints] = useState<{ x: number; y: number }[]>([])
  const [currentPolygonId, setCurrentPolygonId] = useState<string | null>(null)
  
  
  const [isCreatingPolygonSection, setIsCreatingPolygonSection] = useState(false)
  const [polygonSectionPoints, setPolygonSectionPoints] = useState<{ x: number; y: number }[]>([])
  const [currentPolygonSectionId, setCurrentPolygonSectionId] = useState<string | null>(null)
  
  
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  
  // Estados para simetría
  const [symmetryEnabled, setSymmetryEnabled] = useState(false)
  const [symmetryAxis, setSymmetryAxis] = useState<'vertical' | 'horizontal'>('vertical')
  const [symmetryLine, setSymmetryLine] = useState(600) // eslint-disable-line @typescript-eslint/no-unused-vars
  
  // Sistema de Deshacer/Rehacer
  const [history, setHistory] = useState<{sections: Section[], elements: VenueElement[]}[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [clipboard, setClipboard] = useState<{sections: Section[], elements: VenueElement[]} | null>(null)
  
  // Estados para herramientas avanzadas
  const [selectedElements, setSelectedElements] = useState<string[]>([]) // eslint-disable-line @typescript-eslint/no-unused-vars
  const [showLayers, setShowLayers] = useState(false)
  const [layers, setLayers] = useState<{id: string, name: string, visible: boolean, locked: boolean}[]>([
    { id: 'default', name: 'Capa Principal', visible: true, locked: false }
  ])
  
  
  const [newElementName, setNewElementName] = useState('')
  const [newElementColor, setNewElementColor] = useState(COLORS[0])
  const [textContent, setTextContent] = useState('Texto')
  const [entranceType, setEntranceType] = useState<'main' | 'emergency' | 'vip' | 'service'>('main')
  
  
  const [sidebarVisible, setSidebarVisible] = useState(true)

  // Estados para herramienta de mano (hand tool)
  const [isDraggingElement, setIsDraggingElement] = useState(false)
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  
  const getThemeColors = useCallback(() => {
    const isDark = resolvedTheme === 'dark'
    return {
      grid: isDark ? '#4b5563' : '#e5e7eb', 
      text: isDark ? '#f9fafb' : '#111827',
      canvas: isDark ? '#111827' : '#ffffff', 
      border: isDark ? '#6b7280' : '#d1d5db',
      panelBg: isDark ? '#374151' : '#ffffff',
      selectedBg: isDark ? '#1e40af' : '#3b82f6',
      selectedBorder: isDark ? '#3b82f6' : '#1d4ed8'
    }
  }, [resolvedTheme])

  
  const snapToGridCoords = useCallback((x: number, y: number) => {
    if (!snapToGrid) return { x, y }
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    }
  }, [snapToGrid, gridSize])

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    const rawX = (e.clientX - rect.left - offset.x) / scale
    const rawY = (e.clientY - rect.top - offset.y) / scale
    
    return snapToGridCoords(rawX, rawY)
  }, [offset, scale, snapToGridCoords])

  const getResizeHandles = useCallback((element: VenueElement) => {
    if (!('width' in element && 'height' in element)) return []
    
    const handleSize = 8 / scale
    const { x, y, width, height } = element
    
    return [
      { type: 'nw' as const, x: x - handleSize/2, y: y - handleSize/2, size: handleSize },
      { type: 'ne' as const, x: x + width - handleSize/2, y: y - handleSize/2, size: handleSize },
      { type: 'sw' as const, x: x - handleSize/2, y: y + height - handleSize/2, size: handleSize },
      { type: 'se' as const, x: x + width - handleSize/2, y: y + height - handleSize/2, size: handleSize },
    ]
  }, [scale])

  
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!showGrid) return
    
    const colors = getThemeColors()
    ctx.strokeStyle = colors.grid
    ctx.lineWidth = 0.5
    ctx.globalAlpha = 0.3

    const gridSpacing = gridSize * scale
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

    ctx.globalAlpha = 1
  }, [scale, offset, getThemeColors, showGrid, gridSize])

  const drawResizeHandles = useCallback((ctx: CanvasRenderingContext2D, element: VenueElement) => {
    if (!selectedElement || selectedElement !== element.id) return
    if (!('width' in element && 'height' in element)) return
    
    const colors = getThemeColors()
    const handles = getResizeHandles(element)
    
    handles.forEach(handle => {
      const x = (handle.x * scale) + offset.x
      const y = (handle.y * scale) + offset.y
      const size = handle.size * scale
      
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(x + 1, y + 1, size, size)
      
      
      ctx.fillStyle = colors.selectedBg
      ctx.fillRect(x, y, size, size)
      
      
      ctx.strokeStyle = colors.selectedBorder
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, size, size)
    })
  }, [selectedElement, scale, offset, getThemeColors, getResizeHandles])

  const drawSection = useCallback((ctx: CanvasRenderingContext2D, section: Section) => {
    const colors = getThemeColors()
    const x = (section.x * scale) + offset.x
    const y = (section.y * scale) + offset.y
    const width = section.width * scale
    const height = section.height * scale

    ctx.save()
    ctx.translate(x + width/2, y + height/2)
    ctx.rotate(section.rotation * Math.PI / 180)

    
    const isSelected = selectedElement === section.id
    ctx.fillStyle = isSelected ? section.color + '60' : section.color + '30' 
    ctx.strokeStyle = section.color
    ctx.lineWidth = isSelected ? 3 : 2
    ctx.fillRect(-width/2, -height/2, width, height)
    ctx.strokeRect(-width/2, -height/2, width, height)

    
    if (scale > 0.4) { 
      ctx.fillStyle = colors.canvas
      ctx.strokeStyle = colors.text
      ctx.lineWidth = 2
      const textY = -height/2 + 15 * scale
      
      
      ctx.globalAlpha = 0.8
      ctx.fillRect(-width/3, textY - 8 * scale, (width * 2)/3, 16 * scale)
      ctx.globalAlpha = 1
      
      ctx.fillStyle = colors.text
      ctx.font = `bold ${Math.max(12 * scale, 10)}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(section.name, 0, textY)
    }

    
    section.seats.forEach(seat => {
      const seatX = (seat.x - section.width/2) * scale
      const seatY = (seat.y - section.height/2) * scale
      
      
      let seatColor = ''
      switch (seat.status) {
        case 'AVAILABLE':
          seatColor = '#22c55e' 
          break
        case 'BLOCKED':
          seatColor = '#ef4444' 
          break
        default:
          seatColor = '#f59e0b' 
          break
      }
      
      ctx.fillStyle = seatColor
      ctx.strokeStyle = colors.text
      ctx.lineWidth = 1.5
      
      if (seat.isAccessible) {
        
        const seatSize = (SEAT_SIZE/2) * scale * 0.4
        ctx.fillRect(seatX - seatSize, seatY - seatSize, seatSize * 2, seatSize * 2)
        ctx.strokeRect(seatX - seatSize, seatY - seatSize, seatSize * 2, seatSize * 2)
      } else {
        
        ctx.beginPath()
        ctx.arc(seatX, seatY, (SEAT_SIZE/2) * scale * 0.4, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
      }

      
      if (scale > 0.5) { 
        ctx.fillStyle = colors.text
        ctx.font = `bold ${Math.max(8 * scale, 8)}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(seat.row + seat.number, seatX, seatY + 1)
      }
    })

    ctx.restore()
  }, [scale, offset, selectedElement, getThemeColors])

  
  const drawStage = useCallback((ctx: CanvasRenderingContext2D, stage: Stage) => {
    const colors = getThemeColors()
    const x = (stage.x * scale) + offset.x
    const y = (stage.y * scale) + offset.y
    const width = stage.width * scale
    const height = stage.height * scale

    ctx.save()
    ctx.translate(x + width/2, y + height/2)
    ctx.rotate(stage.rotation * Math.PI / 180)

    const isSelected = selectedElement === stage.id
    
    
    const gradient = ctx.createLinearGradient(-width/2, -height/2, width/2, height/2)
    gradient.addColorStop(0, stage.color + 'CC')
    gradient.addColorStop(1, stage.color + '80')
    
    ctx.fillStyle = gradient
    ctx.strokeStyle = stage.color
    ctx.lineWidth = isSelected ? 4 : 2
    ctx.fillRect(-width/2, -height/2, width, height)
    ctx.strokeRect(-width/2, -height/2, width, height)

    
    if (scale > 0.3) {
      ctx.fillStyle = colors.text
      ctx.font = `bold ${Math.max(16 * scale, 12)}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('🎭', 0, -8)
      ctx.fillText(stage.name, 0, 8)
    }

    ctx.restore()
  }, [scale, offset, selectedElement, getThemeColors])

  
  const drawShape = useCallback((ctx: CanvasRenderingContext2D, shape: Shape) => {
    const x = (shape.x * scale) + offset.x
    const y = (shape.y * scale) + offset.y
    const width = shape.width * scale
    const height = shape.height * scale

    ctx.save()
    ctx.translate(x + width/2, y + height/2)
    ctx.rotate(shape.rotation * Math.PI / 180)

    const isSelected = selectedElement === shape.id
    
    ctx.strokeStyle = shape.strokeColor
    ctx.lineWidth = (shape.strokeWidth || 2) * (isSelected ? 2 : 1)
    
    if (shape.filled) {
      ctx.fillStyle = shape.color + (isSelected ? 'AA' : '60')
    }

    if (shape.type === 'rectangle') {
      if (shape.filled) {
        ctx.fillRect(-width/2, -height/2, width, height)
      }
      ctx.strokeRect(-width/2, -height/2, width, height)
    } else if (shape.type === 'circle') {
      const radius = Math.min(width, height) / 2
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, 2 * Math.PI)
      if (shape.filled) {
        ctx.fill()
      }
      ctx.stroke()
    }

    ctx.restore()
  }, [scale, offset, selectedElement])

  
  const drawText = useCallback((ctx: CanvasRenderingContext2D, textElement: TextElement) => {
    const x = (textElement.x * scale) + offset.x
    const y = (textElement.y * scale) + offset.y

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(textElement.rotation * Math.PI / 180)

    const isSelected = selectedElement === textElement.id
    
    ctx.fillStyle = textElement.color
    ctx.font = `${textElement.fontWeight} ${Math.max(textElement.fontSize * scale, 10)}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    
    if (isSelected) {
      const metrics = ctx.measureText(textElement.content)
      const textHeight = textElement.fontSize * scale
      ctx.fillStyle = 'rgba(0, 83, 204, 0.2)'
      ctx.fillRect(-metrics.width/2 - 4, -textHeight/2 - 2, metrics.width + 8, textHeight + 4)
      ctx.fillStyle = textElement.color
    }
    
    ctx.fillText(textElement.content, 0, 0)

    ctx.restore()
  }, [scale, offset, selectedElement])

  
  const drawPolygon = useCallback((ctx: CanvasRenderingContext2D, polygon: Polygon) => {
    if (polygon.points.length < 3) return 

    const isSelected = selectedElement === polygon.id
    
    ctx.save()
    
    
    ctx.beginPath()
    const firstPoint = polygon.points[0]
    ctx.moveTo(
      (firstPoint.x * scale) + offset.x,
      (firstPoint.y * scale) + offset.y
    )
    
    for (let i = 1; i < polygon.points.length; i++) {
      const point = polygon.points[i]
      ctx.lineTo(
        (point.x * scale) + offset.x,
        (point.y * scale) + offset.y
      )
    }
    ctx.closePath()
    
    
    if (polygon.filled) {
      ctx.fillStyle = polygon.color + (isSelected ? '80' : '40')
      ctx.fill()
    }
    
    
    ctx.strokeStyle = polygon.strokeColor || polygon.color
    ctx.lineWidth = isSelected ? polygon.strokeWidth + 2 : polygon.strokeWidth
    ctx.stroke()
    
    
    if (isSelected || scale > 0.5) {
      ctx.fillStyle = isSelected ? '#0053CC' : polygon.color + '80'
      polygon.points.forEach((point, index) => {
        ctx.beginPath()
        ctx.arc(
          (point.x * scale) + offset.x,
          (point.y * scale) + offset.y,
          isSelected ? 5 : 3,
          0,
          2 * Math.PI
        )
        ctx.fill()
        
        // Mostrar número del vértice si está seleccionado
        if (isSelected && scale > 0.3) {
          ctx.fillStyle = '#ffffff'
          ctx.font = `bold ${Math.max(10, 8 * scale)}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(
            (index + 1).toString(),
            (point.x * scale) + offset.x,
            (point.y * scale) + offset.y
          )
          ctx.fillStyle = isSelected ? '#0053CC' : polygon.color + '80'
        }
      })
    }
    
    
    if (scale > 0.3) {
      
      const centerX = polygon.points.reduce((sum, p) => sum + p.x, 0) / polygon.points.length
      const centerY = polygon.points.reduce((sum, p) => sum + p.y, 0) / polygon.points.length
      
      ctx.fillStyle = polygon.color
      ctx.font = `bold ${Math.max(12 * scale, 10)}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        polygon.name,
        (centerX * scale) + offset.x,
        (centerY * scale) + offset.y
      )
    }

    ctx.restore()
  }, [scale, offset, selectedElement])

  
  const drawPolygonSection = useCallback((ctx: CanvasRenderingContext2D, polygonSection: PolygonSection) => {
    if (polygonSection.points.length < 3) return 

    const isSelected = selectedElement === polygonSection.id
    
    ctx.save()
    
    
    ctx.beginPath()
    const firstPoint = polygonSection.points[0]
    ctx.moveTo(
      (firstPoint.x * scale) + offset.x,
      (firstPoint.y * scale) + offset.y
    )
    
    for (let i = 1; i < polygonSection.points.length; i++) {
      const point = polygonSection.points[i]
      ctx.lineTo(
        (point.x * scale) + offset.x,
        (point.y * scale) + offset.y
      )
    }
    ctx.closePath()
    
    
    ctx.fillStyle = polygonSection.color + (isSelected ? '80' : '40')
    ctx.fill()
    
    
    ctx.strokeStyle = polygonSection.color
    ctx.lineWidth = isSelected ? 4 : 2
    ctx.stroke()
    
    // No renderizar asientos individuales - solo mostrar la sección como área
    
    // Mostrar puntos de control cuando está seleccionada
    if (isSelected) {
      ctx.fillStyle = '#0053CC'
      polygonSection.points.forEach(point => {
        ctx.beginPath()
        ctx.arc(
          (point.x * scale) + offset.x,
          (point.y * scale) + offset.y,
          4,
          0,
          2 * Math.PI
        )
        ctx.fill()
      })
    }
    
    
    if (scale > 0.3) {
      
      const centerX = polygonSection.points.reduce((sum, p) => sum + p.x, 0) / polygonSection.points.length
      const centerY = polygonSection.points.reduce((sum, p) => sum + p.y, 0) / polygonSection.points.length
      
      ctx.fillStyle = polygonSection.color
      ctx.font = `bold ${Math.max(14 * scale, 12)}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      
      ctx.fillText(
        polygonSection.name,
        (centerX * scale) + offset.x,
        (centerY * scale) + offset.y - 10
      )
      
      
      if (scale > 0.6) {
        ctx.font = `${Math.max(10 * scale, 8)}px Arial`
        ctx.fillText(
          `${polygonSection.capacity || 0} asientos`,
          (centerX * scale) + offset.x,
          (centerY * scale) + offset.y + 10
        )
      }
    }

    ctx.restore()
  }, [scale, offset, selectedElement])

  
  const drawEntrance = useCallback((ctx: CanvasRenderingContext2D, entrance: Entrance) => {
    const x = (entrance.x * scale) + offset.x
    const y = (entrance.y * scale) + offset.y
    const width = entrance.width * scale
    const height = entrance.height * scale

    ctx.save()
    ctx.translate(x + width/2, y + height/2)
    ctx.rotate(entrance.rotation * Math.PI / 180)

    const isSelected = selectedElement === entrance.id
    
    
    const entranceColor = ENTRANCE_COLORS[entrance.entranceType]
    
    ctx.fillStyle = entranceColor + (isSelected ? 'AA' : '40')
    ctx.strokeStyle = entranceColor
    ctx.lineWidth = isSelected ? 4 : 2
    ctx.fillRect(-width/2, -height/2, width, height)
    ctx.strokeRect(-width/2, -height/2, width, height)

    
    if (scale > 0.3) {
      ctx.fillStyle = entranceColor
      ctx.font = `bold ${Math.max(12 * scale, 10)}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      const icon = entrance.entranceType === 'emergency' ? '🚨' : 
                   entrance.entranceType === 'vip' ? '⭐' :
                   entrance.entranceType === 'service' ? '🔧' : '🚪'
      
      ctx.fillText(icon, 0, -8)
      ctx.fillText(entrance.name, 0, 8)
    }

    ctx.restore()
  }, [scale, offset, selectedElement])

  
  const getCursor = useCallback((e: MouseEvent): string => {
    const canvas = canvasRef.current
    if (!canvas) return 'default'

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - offset.x) / scale
    const y = (e.clientY - rect.top - offset.y) / scale

    
    if (isEditingInPlace) return 'default'

    
    if (isDrawing && !selectedElement) {
      return tool === 'text' ? 'text' : 'crosshair'
    }

    
    if (selectedElement && !isDrawing) {
      const element = elements.find(el => el.id === selectedElement)
      if (element) {
        const handles = getResizeHandles(element)
        for (const handle of handles) {
          const distance = Math.sqrt((x - handle.x) ** 2 + (y - handle.y) ** 2)
          if (distance <= 8) {
            switch (handle.type) {
              case 'nw': return 'nw-resize'
              case 'ne': return 'ne-resize'
              case 'sw': return 'sw-resize'
              case 'se': return 'se-resize'
            }
          }
        }
      }
    }

    
    const elementUnderMouse = elements.find(element => {
      if (element.type === 'section') {
        const sectionElement = element as Section
        return x >= sectionElement.x && x <= sectionElement.x + sectionElement.width &&
               y >= sectionElement.y && y <= sectionElement.y + sectionElement.height
      } else if (element.type === 'stage') {
        const stage = element as Stage
        return x >= stage.x && x <= stage.x + stage.width &&
               y >= stage.y && y <= stage.y + stage.height
      } else if (element.type === 'entrance') {
        const entrance = element as Entrance
        return x >= entrance.x && x <= entrance.x + entrance.width &&
               y >= entrance.y && y <= entrance.y + entrance.height
      } else if (element.type === 'text') {
        const textEl = element as TextElement
        const textWidth = textEl.fontSize * 6 
        const textHeight = textEl.fontSize * 1.2
        return x >= textEl.x - textWidth/2 && x <= textEl.x + textWidth/2 &&
               y >= textEl.y - textHeight/2 && y <= textEl.y + textHeight/2
      } else if (element.type === 'rectangle' || element.type === 'circle') {
        const shape = element as Shape
        if (element.type === 'rectangle') {
          return x >= shape.x && x <= shape.x + shape.width &&
                 y >= shape.y && y <= shape.y + shape.height
        } else if (element.type === 'circle') {
          const centerX = shape.x + shape.width / 2
          const centerY = shape.y + shape.height / 2
          const radius = Math.min(shape.width, shape.height) / 2
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
          return distance <= radius
        }
      }
      return false
    })

    if (elementUnderMouse) {
      if (tool === 'hand') {
        return isDraggingElement ? 'grabbing' : 'grab'
      }
      return tool === 'select' ? 'pointer' : 'pointer'
    }

    
    switch (tool) {
      case 'select': return 'default'
      case 'hand': return 'grab'
      case 'text': return 'text'
      case 'polygon': return isCreatingPolygon ? 'crosshair' : 'copy'
      case 'polygonSection': return 'crosshair'
      case 'section':
      case 'stage':
      case 'entrance':
      case 'rectangle':
      case 'circle': 
        return 'crosshair'
      default: 
        return 'default'
    }
  }, [scale, offset, selectedElement, elements, tool, isDrawing, isEditingInPlace, getResizeHandles, isCreatingPolygon, isDraggingElement])

  
  const calculateOptimalDimensions = useCallback((totalSeats: number, seatsPerRow: number, seatSpacing: number, rowSpacing: number) => {
    const rows = Math.ceil(totalSeats / seatsPerRow)
    const seatsInLastRow = totalSeats % seatsPerRow || seatsPerRow
    
    
    const maxSeatsInRow = Math.max(seatsPerRow, seatsInLastRow)
    const width = (maxSeatsInRow * seatSpacing) + seatSpacing 
    
    
    const height = (rows * rowSpacing) + rowSpacing 
    
    return {
      width: Math.max(width, 100), 
      height: Math.max(height, 100), 
      rows,
      seatsInLastRow,
      actualSeats: totalSeats
    }
  }, [])

  const generateSeatsForSectionWithSpacing = useCallback((section: Section, seatsPerRow: number, seatSpacing: number, rowSpacing: number): Seat[] => {
    const seats: Seat[] = []
    const rows = Math.ceil(desiredSeats / seatsPerRow)
    
    for (let row = 0; row < rows; row++) {
      const rowLabel = String.fromCharCode(65 + row) 
      const seatsInThisRow = row === rows - 1 ? (desiredSeats % seatsPerRow || seatsPerRow) : seatsPerRow
      
      for (let seat = 0; seat < seatsInThisRow; seat++) {
        const seatX = seatSpacing + (seat * seatSpacing)
        const seatY = rowSpacing + (row * rowSpacing)
        
        seats.push({
          id: `${section.id}-${rowLabel}${seat + 1}`,
          row: rowLabel,
          number: (seat + 1).toString(),
          x: seatX,
          y: seatY,
          status: 'AVAILABLE',
          isAccessible: false
        })
      }
    }
    
    return seats
  }, [desiredSeats])

  
  const createSectionBySeats = useCallback((x: number, y: number) => {
    const dimensions = calculateOptimalDimensions(desiredSeats, seatsPerRow, seatSpacing, rowSpacing)
    
    const newSection: Section = {
      id: Date.now().toString(),
      type: 'section',
      name: newSectionName || `Sección ${sections.length + 1} (${dimensions.actualSeats} asientos)`,
      color: newSectionColor,
      x,
      y,
      width: dimensions.width,
      height: dimensions.height,
      rotation: 0,
      seats: []
    }
    
    
    const seats = generateSeatsForSectionWithSpacing(newSection, seatsPerRow, seatSpacing, rowSpacing)
    newSection.seats = seats
    
    return newSection
  }, [desiredSeats, seatsPerRow, seatSpacing, rowSpacing, newSectionName, newSectionColor, sections.length, calculateOptimalDimensions, generateSeatsForSectionWithSpacing])

  
  const isPointInPolygon = useCallback((point: { x: number; y: number }, polygon: { x: number; y: number }[]): boolean => { // eslint-disable-line @typescript-eslint/no-unused-vars
    let inside = false
    let j = polygon.length - 1

    for (let i = 0; i < polygon.length; i++) {
      const xi = polygon[i].x
      const yi = polygon[i].y
      const xj = polygon[j].x
      const yj = polygon[j].y

      if (((yi > point.y) !== (yj > point.y)) && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside
      }
      j = i
    }

    return inside
  }, [])

  // Función para crear elemento simétrico
  const createSymmetricElement = useCallback((element: VenueElement) => {
    if (!symmetryEnabled) return null

    const canvasWidth = 1200
    const canvasHeight = 800
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2

    const symmetricElement: VenueElement = {
      ...element,
      id: `${element.id}-symmetric`,
    } as VenueElement

    if (symmetryAxis === 'vertical') {
      // Simetría vertical (espejo horizontal)
      if (element.type === 'section') {
        (symmetricElement as Section).x = centerX * 2 - element.x - element.width
      } else if (element.type === 'polygonSection') {
        (symmetricElement as PolygonSection).points = element.points.map(point => ({
          x: centerX * 2 - point.x,
          y: point.y
        }))
      } else if ('x' in element && 'x' in symmetricElement) {
        (symmetricElement as Stage | Shape | TextElement | Entrance).x = centerX * 2 - (element as Stage | Shape | TextElement | Entrance).x
      }
    } else {
      // Simetría horizontal (espejo vertical)
      if (element.type === 'section') {
        (symmetricElement as Section).y = centerY * 2 - element.y - element.height
      } else if (element.type === 'polygonSection') {
        (symmetricElement as PolygonSection).points = element.points.map(point => ({
          x: point.x,
          y: centerY * 2 - point.y
        }))
      } else if ('y' in element && 'y' in symmetricElement) {
        (symmetricElement as Stage | Shape | TextElement | Entrance).y = centerY * 2 - (element as Stage | Shape | TextElement | Entrance).y
      }
    }

    return symmetricElement
  }, [symmetryEnabled, symmetryAxis])

  // Funciones del sistema de historial
  const saveToHistory = useCallback(() => {
    const currentState = { sections, elements }
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(currentState)
      // Mantener solo los últimos 50 estados
      if (newHistory.length > 50) {
        newHistory.shift()
        return newHistory
      }
      return newHistory
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [sections, elements, historyIndex])

  // Ref para guardar el timeout del debounce
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // useEffect para detectar cambios y activar guardado automático con debounce
  useEffect(() => {
    // Limpiar timeout anterior si existe
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Crear nuevo timeout
    saveTimeoutRef.current = setTimeout(() => {
      console.log("💾 Guardado automático:", { sections: sections.length, elements: elements.length });
      onSave?.(sections, elements)
      saveTimeoutRef.current = null
    }, 3000)

    // Cleanup function
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [sections, elements, onSave])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setSections(prevState.sections)
      setElements(prevState.elements)
      setHistoryIndex(prev => prev - 1)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setSections(nextState.sections)
      setElements(nextState.elements)
      setHistoryIndex(prev => prev + 1)
    }
  }, [history, historyIndex])

  // Funciones de copiar/pegar
  const copySelected = useCallback(() => {
    const selectedSections = sections.filter(s => selectedElements.includes(s.id))
    const selectedElementsList = elements.filter(e => selectedElements.includes(e.id))
    setClipboard({ sections: selectedSections, elements: selectedElementsList })
  }, [sections, elements, selectedElements])

  const pasteFromClipboard = useCallback(() => {
    if (!clipboard) return
    
    const newSections = clipboard.sections.map(section => ({
      ...section,
      id: `${section.id}-copy-${Date.now()}`,
      x: section.x + 50,
      y: section.y + 50
    }))
    
    const newElements = clipboard.elements.map(element => {
      const baseElement = {
        ...element,
        id: `${element.id}-copy-${Date.now()}`
      }
      
      if ('x' in element && 'y' in element) {
        return {
          ...baseElement,
          x: (element as Stage | Shape | TextElement | Entrance).x + 50,
          y: (element as Stage | Shape | TextElement | Entrance).y + 50
        }
      } else if (element.type === 'polygonSection') {
        return {
          ...baseElement,
          points: (element as PolygonSection).points.map(p => ({ x: p.x + 50, y: p.y + 50 }))
        }
      }
      
      return baseElement
    })
    
    setSections(prev => [...prev, ...newSections])
    setElements(prev => [...prev, ...newElements])
    saveToHistory()
  }, [clipboard, saveToHistory])

  // Funciones de alineación
  const alignElements = useCallback((alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedElements.length < 2) return
    
    const selectedSections = sections.filter(s => selectedElements.includes(s.id))
    const selectedElementsList = elements.filter(e => selectedElements.includes(e.id))
    
    let referenceValue = 0
    
    // Calcular valor de referencia
    if (alignment === 'left') {
      referenceValue = Math.min(
        ...selectedSections.map(s => s.x),
        ...selectedElementsList.filter(e => 'x' in e).map(e => (e as Section | Stage | Shape | TextElement | Entrance).x)
      )
    } else if (alignment === 'right') {
      referenceValue = Math.max(
        ...selectedSections.map(s => s.x + s.width),
        ...selectedElementsList.filter(e => 'x' in e && 'width' in e).map(e => (e as Section | Stage | Shape | Entrance).x + (e as Section | Stage | Shape | Entrance).width)
      )
    } else if (alignment === 'top') {
      referenceValue = Math.min(
        ...selectedSections.map(s => s.y),
        ...selectedElementsList.filter(e => 'y' in e).map(e => (e as Section | Stage | Shape | TextElement | Entrance).y)
      )
    } else if (alignment === 'bottom') {
      referenceValue = Math.max(
        ...selectedSections.map(s => s.y + s.height),
        ...selectedElementsList.filter(e => 'y' in e && 'height' in e).map(e => (e as Section | Stage | Shape | Entrance).y + (e as Section | Stage | Shape | Entrance).height)
      )
    }
    
    // Aplicar alineación
    if (alignment === 'left') {
      setSections(prev => prev.map(s => 
        selectedElements.includes(s.id) ? { ...s, x: referenceValue } : s
      ))
      setElements(prev => prev.map(e => 
        selectedElements.includes(e.id) && 'x' in e ? { ...e, x: referenceValue } : e
      ))
    }
    
    saveToHistory()
  }, [selectedElements, sections, elements, saveToHistory])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const colors = getThemeColors()

    
    ctx.fillStyle = colors.canvas
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    
    drawGrid(ctx, canvas)

    
    sections.forEach(section => {
      drawSection(ctx, section)
      
      drawResizeHandles(ctx, section)
    })
    
    
    elements.forEach(element => {
      if ('type' in element) {
        switch (element.type) {
          case 'polygonSection':
            drawPolygonSection(ctx, element as PolygonSection)
            break
          case 'stage':
            drawStage(ctx, element as Stage)
            break
          case 'rectangle':
          case 'circle':
            drawShape(ctx, element as Shape)
            break
          case 'text':
            drawText(ctx, element as TextElement)
            break
          case 'entrance':
            drawEntrance(ctx, element as Entrance)
            break
          case 'polygon':
            drawPolygon(ctx, element as Polygon)
            break
        }
        
        if (element.type !== 'text' && element.type !== 'polygonSection') {
          drawResizeHandles(ctx, element)
        }
      }
    })

    
    if (tool === 'polygonSection' && isCreatingPolygonSection && polygonSectionPoints.length > 0) {
      ctx.strokeStyle = newSectionColor
      ctx.fillStyle = newSectionColor
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      
      
      ctx.beginPath()
      const firstPoint = polygonSectionPoints[0]
      ctx.moveTo(
        (firstPoint.x * scale) + offset.x,
        (firstPoint.y * scale) + offset.y
      )
      
      
      for (let i = 1; i < polygonSectionPoints.length; i++) {
        const point = polygonSectionPoints[i]
        ctx.lineTo(
          (point.x * scale) + offset.x,
          (point.y * scale) + offset.y
        )
      }
      
      ctx.stroke()
      
      
      polygonSectionPoints.forEach(point => {
        ctx.beginPath()
        ctx.arc(
          (point.x * scale) + offset.x,
          (point.y * scale) + offset.y,
          6,
          0,
          2 * Math.PI
        )
        ctx.fill()
      })
      
      
      ctx.setLineDash([])
      
      
      if (mousePosition && polygonSectionPoints.length > 0) {
        const lastPoint = polygonSectionPoints[polygonSectionPoints.length - 1]
        ctx.strokeStyle = newSectionColor
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        ctx.globalAlpha = 0.7
        
        ctx.beginPath()
        ctx.moveTo(
          (lastPoint.x * scale) + offset.x,
          (lastPoint.y * scale) + offset.y
        )
        ctx.lineTo(
          (mousePosition.x * scale) + offset.x,
          (mousePosition.y * scale) + offset.y
        )
        ctx.stroke()
        
        ctx.globalAlpha = 1
        ctx.setLineDash([])
      }
    }

    
    if (tool === 'polygon' && isCreatingPolygon && polygonPoints.length > 0) {
      const colors = getThemeColors()
      ctx.strokeStyle = colors.selectedBg
      ctx.fillStyle = colors.selectedBg
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      
      
      ctx.beginPath()
      const firstPoint = polygonPoints[0]
      ctx.moveTo(
        (firstPoint.x * scale) + offset.x,
        (firstPoint.y * scale) + offset.y
      )
      
      
      for (let i = 1; i < polygonPoints.length; i++) {
        const point = polygonPoints[i]
        ctx.lineTo(
          (point.x * scale) + offset.x,
          (point.y * scale) + offset.y
        )
      }
      
      ctx.stroke()
      
      
      polygonPoints.forEach(point => {
        ctx.beginPath()
        ctx.arc(
          (point.x * scale) + offset.x,
          (point.y * scale) + offset.y,
          6,
          0,
          2 * Math.PI
        )
        ctx.fill()
      })
      
      
      ctx.setLineDash([])
      
      
      if (mousePosition && polygonPoints.length > 0) {
        const lastPoint = polygonPoints[polygonPoints.length - 1]
        ctx.strokeStyle = colors.selectedBg
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        ctx.globalAlpha = 0.7
        
        ctx.beginPath()
        ctx.moveTo(
          (lastPoint.x * scale) + offset.x,
          (lastPoint.y * scale) + offset.y
        )
        ctx.lineTo(
          (mousePosition.x * scale) + offset.x,
          (mousePosition.y * scale) + offset.y
        )
        ctx.stroke()
        
        ctx.globalAlpha = 1
        ctx.setLineDash([])
      }
    }

    // Dibujar línea de simetría si está habilitada
    if (symmetryEnabled) {
      const canvasWidth = 1200
      const canvasHeight = 800
      const centerX = canvasWidth / 2
      const centerY = canvasHeight / 2

      ctx.strokeStyle = '#9333ea' // Color púrpura para la línea de simetría
      ctx.lineWidth = 2
      ctx.setLineDash([10, 5])
      ctx.globalAlpha = 0.7

      ctx.beginPath()
      if (symmetryAxis === 'vertical') {
        // Línea vertical en el centro
        ctx.moveTo((centerX * scale) + offset.x, 0)
        ctx.lineTo((centerX * scale) + offset.x, canvasHeight * scale + offset.y)
      } else {
        // Línea horizontal en el centro
        ctx.moveTo(0, (centerY * scale) + offset.y)
        ctx.lineTo(canvasWidth * scale + offset.x, (centerY * scale) + offset.y)
      }
      ctx.stroke()

      ctx.globalAlpha = 1
      ctx.setLineDash([])
    }
  }, [sections, elements, drawGrid, drawSection, drawStage, drawShape, drawText, drawEntrance, drawPolygon, drawPolygonSection, drawResizeHandles, getThemeColors, tool, isCreatingPolygonSection, polygonSectionPoints, newSectionColor, isCreatingPolygon, polygonPoints, mousePosition, scale, offset, symmetryEnabled, symmetryAxis])

  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - offset.x) / scale
    const y = (e.clientY - rect.top - offset.y) / scale

    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      
      setIsPanning(true)
      setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y })
      return
    }

    
    if (tool === 'select' && selectedElement) {
      const element = [...sections, ...elements].find(el => el.id === selectedElement)
      if (element && ('width' in element && 'height' in element)) {
        const handles = getResizeHandles(element)
        const clickedHandle = handles.find(handle => {
          const distance = Math.sqrt(
            Math.pow(x - (handle.x + handle.size/2), 2) + 
            Math.pow(y - (handle.y + handle.size/2), 2)
          )
          return distance <= handle.size
        })
        
        if (clickedHandle) {
          setIsResizing(true)
          setResizeHandle(clickedHandle.type)
          setStartPos({ x, y })
          return
        }
      }
    }

    if (tool === 'section' || tool === 'stage' || tool === 'rectangle' || tool === 'circle' || tool === 'entrance') {
      if (tool === 'section' && creationMode === 'bySeats') {
        
        const snapPos = snapToGridCoords(x, y)
        const newSection = createSectionBySeats(snapPos.x, snapPos.y)
        setSections(prev => [...prev, newSection])
        setSelectedElement(newSection.id)
      } else {
        
        setIsDrawing(true)
        const snapPos = snapToGridCoords(x, y)
        setStartPos(snapPos)
      }
    } else if (tool === 'text') {
      
      const snapPos = snapToGridCoords(x, y)
      const newText: TextElement = {
        id: `text-${Date.now()}`,
        type: 'text',
        content: textContent,
        x: snapPos.x,
        y: snapPos.y,
        fontSize: 16,
        color: newElementColor,
        fontWeight: 'normal',
        rotation: 0
      }
      setElements(prev => [...prev, newText])
      setSelectedElement(newText.id)
      // Guardado automático se encarga del resto
    } else if (tool === 'polygon') {
      
      const snapPos = snapToGridCoords(x, y)
      
      if (!isCreatingPolygon) {
        
        const newPolygonId = `polygon-${Date.now()}`
        setCurrentPolygonId(newPolygonId)
        setIsCreatingPolygon(true)
        setPolygonPoints([snapPos])
      } else {
        // Verificar si se está clickeando cerca del primer punto para cerrar el polígono
        if (polygonPoints.length >= 3) {
          const firstPoint = polygonPoints[0]
          const distance = Math.sqrt(
            Math.pow(snapPos.x - firstPoint.x, 2) + 
            Math.pow(snapPos.y - firstPoint.y, 2)
          )
          
          // Si está cerca del primer punto (menos de 20 unidades), cerrar el polígono
          if (distance < 20) {
            const newPolygon: Polygon = {
              id: currentPolygonId!,
              type: 'polygon',
              name: newElementName || `Polígono ${elements.filter(e => e.type === 'polygon').length + 1}`,
              points: [...polygonPoints],
              rotation: 0,
              color: newElementColor,
              strokeColor: newElementColor,
              strokeWidth: 2,
              filled: true
            }
            
            setElements(prev => [...prev, newPolygon])
            setSelectedElement(newPolygon.id)
            
            // Limpiar estado
            setIsCreatingPolygon(false)
            setPolygonPoints([])
            setCurrentPolygonId(null)
            setMousePosition(null)
            return
          }
        }
        
        // Agregar nuevo punto
        setPolygonPoints(prev => [...prev, snapPos])
      }
    } else if (tool === 'polygonSection') {
      
      const snapPos = snapToGridCoords(x, y)
      
      if (!isCreatingPolygonSection) {
        
        const newPolygonSectionId = `polygonSection-${Date.now()}`
        setCurrentPolygonSectionId(newPolygonSectionId)
        setIsCreatingPolygonSection(true)
        setPolygonSectionPoints([snapPos])
      } else {
        
        setPolygonSectionPoints(prev => [...prev, snapPos])
      }
    } else if (tool === 'select') {
      
      let clickedElement: VenueElement | null = null
      
      
      for (const element of elements) {
        if ('type' in element) {
          const elem = element as Stage | Shape | TextElement | Entrance
          if (elem.type === 'text') {
            
            const textElem = elem as TextElement
            if (Math.abs(x - textElem.x) < 50 && Math.abs(y - textElem.y) < 20) {
              clickedElement = element
              break
            }
          } else {
            
            const rectElem = elem as Stage | Shape | Entrance
            if (x >= rectElem.x && x <= rectElem.x + rectElem.width &&
                y >= rectElem.y && y <= rectElem.y + rectElem.height) {
              clickedElement = element
              break
            }
          }
        }
      }
      
      
      if (!clickedElement) {
        const clickedSection = sections.find(section => 
          x >= section.x && x <= section.x + section.width &&
          y >= section.y && y <= section.y + section.height
        )
        clickedElement = clickedSection || null
      }
      
      setSelectedElement(clickedElement?.id || null)
    } else if (tool === 'hand') {
      // Herramienta de mano - buscar elemento para arrastrar
      let clickedElement: VenueElement | null = null
      
      // Buscar en elementos
      for (const element of elements) {
        if ('type' in element) {
          const elem = element as Stage | Shape | TextElement | Entrance
          if (elem.type === 'text') {
            const textElem = elem as TextElement
            if (Math.abs(x - textElem.x) < 50 && Math.abs(y - textElem.y) < 20) {
              clickedElement = element
              break
            }
          } else {
            const rectElem = elem as Stage | Shape | Entrance
            if (x >= rectElem.x && x <= rectElem.x + rectElem.width &&
                y >= rectElem.y && y <= rectElem.y + rectElem.height) {
              clickedElement = element
              break
            }
          }
        }
      }
      
      // Buscar en secciones si no se encontró elemento
      if (!clickedElement) {
        const clickedSection = sections.find(section => 
          x >= section.x && x <= section.x + section.width &&
          y >= section.y && y <= section.y + section.height
        )
        clickedElement = clickedSection || null
      }
      
      if (clickedElement) {
        setIsDraggingElement(true)
        setDraggedElementId(clickedElement.id)
        setSelectedElement(clickedElement.id)
        // Calcular offset del mouse respecto al elemento
        if ('x' in clickedElement && 'y' in clickedElement) {
          const elementWithPos = clickedElement as Section | Stage | Shape | TextElement | Entrance
          setDragOffset({
            x: x - elementWithPos.x,
            y: y - elementWithPos.y
          })
        }
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const currentX = (e.clientX - rect.left - offset.x) / scale
    const currentY = (e.clientY - rect.top - offset.y) / scale

    if (isPanning) {
      setOffset({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      })
      return
    }

    
    if (isResizing && selectedElement && resizeHandle) {
      const element = [...sections, ...elements].find(el => el.id === selectedElement)
      if (element && ('width' in element && 'height' in element)) {
        const snapPos = snapToGridCoords(currentX, currentY)

        let newProps: { x?: number, y?: number, width?: number, height?: number } = {}

        switch (resizeHandle) {
          case 'nw':
            
            newProps = {
              x: Math.min(snapPos.x, element.x + element.width - 20),
              y: Math.min(snapPos.y, element.y + element.height - 20),
              width: Math.max(20, element.x + element.width - snapPos.x),
              height: Math.max(20, element.y + element.height - snapPos.y)
            }
            break
          case 'ne':
            
            newProps = {
              y: Math.min(snapPos.y, element.y + element.height - 20),
              width: Math.max(20, snapPos.x - element.x),
              height: Math.max(20, element.y + element.height - snapPos.y)
            }
            break
          case 'sw':
            
            newProps = {
              x: Math.min(snapPos.x, element.x + element.width - 20),
              width: Math.max(20, element.x + element.width - snapPos.x),
              height: Math.max(20, snapPos.y - element.y)
            }
            break
          case 'se':
            
            newProps = {
              width: Math.max(20, snapPos.x - element.x),
              height: Math.max(20, snapPos.y - element.y)
            }
            break
        }

        
        if (element.type === 'section') {
          setSections(prev => prev.map(s => 
            s.id === selectedElement ? { ...s, ...newProps } : s
          ))
        } else {
          setElements(prev => prev.map(el => 
            el.id === selectedElement ? { ...el, ...newProps } : el
          ))
        }
      }
      return
    }

    if (isDrawing && (tool === 'section' || tool === 'stage' || tool === 'rectangle' || tool === 'circle' || tool === 'entrance')) {
      redraw()
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const snapPos = snapToGridCoords(currentX, currentY)
      const width = Math.abs(snapPos.x - startPos.x)
      const height = Math.abs(snapPos.y - startPos.y)
      const x = Math.min(startPos.x, snapPos.x)
      const y = Math.min(startPos.y, snapPos.y)

      
      const previewColor = tool === 'entrance' ? ENTRANCE_COLORS[entranceType] : newElementColor
      
      ctx.strokeStyle = previewColor
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      
      if (tool === 'circle') {
        const centerX = (x + width/2) * scale + offset.x
        const centerY = (y + height/2) * scale + offset.y
        const radius = Math.min(width, height) / 2 * scale
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.stroke()
      } else {
        ctx.strokeRect(x * scale + offset.x, y * scale + offset.y, width * scale, height * scale)
        
        
        if (scale > 0.3) {
          ctx.fillStyle = previewColor
          ctx.font = `bold ${Math.max(12 * scale, 10)}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.setLineDash([])
          
          const centerX = (x + width/2) * scale + offset.x
          const centerY = (y + height/2) * scale + offset.y
          
          let previewText = ''
          switch (tool) {
            case 'stage':
              previewText = '🎭 Escenario'
              break
            case 'entrance':
              const icon = entranceType === 'emergency' ? '🚨' : 
                          entranceType === 'vip' ? '⭐' :
                          entranceType === 'service' ? '🔧' : '🚪'
              previewText = `${icon} Entrada`
              break
            case 'rectangle':
              previewText = '⬜ Rectángulo'
              break
            default:
              previewText = 'Sección'
          }
          
          ctx.fillText(previewText, centerX, centerY)
        }
      }
      
      ctx.setLineDash([])
    }

    
    if (tool === 'polygon' && isCreatingPolygon && polygonPoints.length > 0) {
      redraw()
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const snapPos = snapToGridCoords(currentX, currentY)
      
      ctx.strokeStyle = newElementColor
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      
      
      ctx.beginPath()
      const firstPoint = polygonPoints[0]
      ctx.moveTo(
        (firstPoint.x * scale) + offset.x,
        (firstPoint.y * scale) + offset.y
      )
      
      
      for (let i = 1; i < polygonPoints.length; i++) {
        const point = polygonPoints[i]
        ctx.lineTo(
          (point.x * scale) + offset.x,
          (point.y * scale) + offset.y
        )
      }
      
      
      ctx.lineTo(
        (snapPos.x * scale) + offset.x,
        (snapPos.y * scale) + offset.y
      )
      
      
      if (polygonPoints.length >= 2) {
        ctx.lineTo(
          (firstPoint.x * scale) + offset.x,
          (firstPoint.y * scale) + offset.y
        )
      }
      
      ctx.stroke()
      
      
      ctx.fillStyle = newElementColor
      polygonPoints.forEach(point => {
        ctx.beginPath()
        ctx.arc(
          (point.x * scale) + offset.x,
          (point.y * scale) + offset.y,
          4,
          0,
          2 * Math.PI
        )
        ctx.fill()
      })
      
      
      ctx.fillStyle = newElementColor + '80'
      ctx.beginPath()
      ctx.arc(
        (snapPos.x * scale) + offset.x,
        (snapPos.y * scale) + offset.y,
        4,
        0,
        2 * Math.PI
      )
      ctx.fill()
      
      ctx.setLineDash([])
    }

    
    if (tool === 'polygonSection' && isCreatingPolygonSection && polygonSectionPoints.length > 0) {
      redraw()
    }
    
    
    // Dragging con herramienta de mano
    if (isDraggingElement && draggedElementId && tool === 'hand') {
      const snapPos = snapToGridCoords(currentX - dragOffset.x, currentY - dragOffset.y)
      
      // Actualizar posición del elemento arrastrado
      const draggedSection = sections.find(s => s.id === draggedElementId)
      if (draggedSection) {
        setSections(prev => prev.map(s => 
          s.id === draggedElementId ? { ...s, x: snapPos.x, y: snapPos.y } : s
        ))
      } else {
        const draggedElement = elements.find(e => e.id === draggedElementId)
        if (draggedElement && 'x' in draggedElement && 'y' in draggedElement) {
          setElements(prev => prev.map(el => 
            el.id === draggedElementId ? { ...el, x: snapPos.x, y: snapPos.y } : el
          ))
        }
      }
    }
    
    
    if ((tool === 'polygon' && isCreatingPolygon) || (tool === 'polygonSection' && isCreatingPolygonSection)) {
      setMousePosition({ x: currentX, y: currentY })
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false)
      return
    }

    if (isResizing) {
      setIsResizing(false)
      setResizeHandle(null)
      return
    }

    if (isDrawing) {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const currentX = (e.clientX - rect.left - offset.x) / scale
      const currentY = (e.clientY - rect.top - offset.y) / scale

      const snapPos = snapToGridCoords(currentX, currentY)
      const width = Math.abs(snapPos.x - startPos.x)
      const height = Math.abs(snapPos.y - startPos.y)
      const x = Math.min(startPos.x, snapPos.x)
      const y = Math.min(startPos.y, snapPos.y)

      if (width > 10 && height > 10) { 
        if (tool === 'section') {
          if (creationMode === 'bySeats') {
            
            const newSection = createSectionBySeats(x, y)
            const sectionsToAdd = [newSection]
            
            // Crear sección simétrica si está habilitado
            if (symmetryEnabled) {
              const symmetricElement = createSymmetricElement(newSection)
              if (symmetricElement) {
                sectionsToAdd.push(symmetricElement as Section)
              }
            }
            
            setSections(prev => [...prev, ...sectionsToAdd])
            setSelectedElement(newSection.id)
          } else {
            
            const newSection: Section = {
              id: Date.now().toString(),
              type: 'section',
              name: newSectionName || `Sección ${sections.length + 1}`,
              color: newSectionColor,
              x,
              y,
              width,
              height,
              rotation: 0,
              seats: []
            }
            
            const sectionsToAdd = [newSection]
            
            // Crear sección simétrica si está habilitado
            if (symmetryEnabled) {
              const symmetricElement = createSymmetricElement(newSection)
              if (symmetricElement) {
                sectionsToAdd.push(symmetricElement as Section)
              }
            }
            
            setSections(prev => [...prev, ...sectionsToAdd])
            setSelectedElement(newSection.id)
          }
        } else if (tool === 'stage') {
          const newStage: Stage = {
            id: `stage-${Date.now()}`,
            type: 'stage',
            name: newElementName || `Escenario ${elements.filter(e => 'type' in e && e.type === 'stage').length + 1}`,
            x,
            y,
            width,
            height,
            rotation: 0,
            color: newElementColor
          }
          setElements(prev => [...prev, newStage])
          setSelectedElement(newStage.id)
          // Guardado automático se encarga del resto
        } else if (tool === 'rectangle') {
          const newShape: Shape = {
            id: `rect-${Date.now()}`,
            type: 'rectangle',
            name: newElementName || `Rectángulo ${elements.filter(e => 'type' in e && e.type === 'rectangle').length + 1}`,
            x,
            y,
            width,
            height,
            rotation: 0,
            color: newElementColor,
            strokeColor: newElementColor,
            strokeWidth: 2,
            filled: true
          }
          setElements(prev => [...prev, newShape])
          setSelectedElement(newShape.id)
          // Guardado automático se encarga del resto
        } else if (tool === 'circle') {
          const newShape: Shape = {
            id: `circle-${Date.now()}`,
            type: 'circle',
            name: newElementName || `Círculo ${elements.filter(e => 'type' in e && e.type === 'circle').length + 1}`,
            x,
            y,
            width,
            height,
            rotation: 0,
            color: newElementColor,
            strokeColor: newElementColor,
            strokeWidth: 2,
            filled: true
          }
          setElements(prev => [...prev, newShape])
          setSelectedElement(newShape.id)
          // Guardado automático se encarga del resto
        } else if (tool === 'entrance') {
          const newEntrance: Entrance = {
            id: `entrance-${Date.now()}`,
            type: 'entrance',
            name: newElementName || `Entrada ${elements.filter(e => 'type' in e && e.type === 'entrance').length + 1}`,
            x,
            y,
            width,
            height,
            rotation: 0,
            color: ENTRANCE_COLORS[entranceType],
            entranceType
          }
          setElements(prev => [...prev, newEntrance])
          setSelectedElement(newEntrance.id)
          // Guardado automático se encarga del resto
        }
      } else {
        console.log("❌ Figura demasiado pequeña para crear:", { width, height, minSize: 10, tool });
      }

      setIsDrawing(false)
    }

    // Finalizar dragging con herramienta de mano
    if (isDraggingElement && tool === 'hand') {
      setIsDraggingElement(false)
      setDraggedElementId(null)
      setDragOffset({ x: 0, y: 0 })
      // Guardar en historial después del drag
      saveToHistory()
    }
  }

  const generateSeatsForSection = (section: Section) => {
    const seats: Seat[] = []
    const rows = Math.floor(section.height / 40) 
    const seatsPerRow = Math.floor(section.width / 30) 

    for (let row = 0; row < rows; row++) {
      const rowLabel = String.fromCharCode(65 + row) 
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
    if (selectedElement === sectionId) {
      setSelectedElement(null)
    }
  }

  
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Terminar polígono en creación con doble clic (solo si tiene al menos 3 puntos)
    if (tool === 'polygon' && isCreatingPolygon && polygonPoints.length >= 3) {
      const newPolygon: Polygon = {
        id: currentPolygonId!,
        type: 'polygon',
        name: newElementName || `Polígono ${elements.filter(e => e.type === 'polygon').length + 1}`,
        points: [...polygonPoints],
        rotation: 0,
        color: newElementColor,
        strokeColor: newElementColor,
        strokeWidth: 2,
        filled: true
      }
      
      const elementsToAdd = [newPolygon]
      
      // Crear elemento simétrico si está habilitado
      if (symmetryEnabled) {
        const symmetricElement = createSymmetricElement(newPolygon)
        if (symmetricElement) {
          elementsToAdd.push(symmetricElement as Polygon)
        }
      }
      
      setElements(prev => [...prev, ...elementsToAdd])
      setSelectedElement(newPolygon.id)
      
      // Limpiar estado
      setIsCreatingPolygon(false)
      setPolygonPoints([])
      setCurrentPolygonId(null)
      setMousePosition(null)
      return
    }
    
    // Terminar sección polígono en creación con doble clic (solo si tiene al menos 3 puntos)
    if (tool === 'polygonSection' && isCreatingPolygonSection && polygonSectionPoints.length >= 3) {
      const newPolygonSection: PolygonSection = {
        id: currentPolygonSectionId!,
        type: 'polygonSection',
        name: newSectionName || `Sección Polígono ${elements.filter(e => e.type === 'polygonSection').length + 1}`,
        points: [...polygonSectionPoints],
        rotation: 0,
        color: newSectionColor,
        capacity: 50, // Capacidad inicial por defecto
        seats: [] // Sin generación automática de asientos
      }
      
      const elementsToAdd = [newPolygonSection]
      
      // Crear elemento simétrico si está habilitado
      if (symmetryEnabled) {
        const symmetricElement = createSymmetricElement(newPolygonSection)
        if (symmetricElement) {
          elementsToAdd.push(symmetricElement as PolygonSection)
        }
      }
      
      setElements(prev => [...prev, ...elementsToAdd])
      setSelectedElement(newPolygonSection.id)
      
      // Limpiar estado
      setIsCreatingPolygonSection(false)
      setPolygonSectionPoints([])
      setCurrentPolygonSectionId(null)
      setMousePosition(null)
      return
    }
    
    if (tool !== 'select') return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - offset.x) / scale
    const y = (e.clientY - rect.top - offset.y) / scale

    
    let clickedElement: VenueElement | null = null
    
    for (const element of elements) {
      if ('type' in element) {
        if (element.type === 'text') {
          
          const textElement = element as TextElement
          if (x >= textElement.x - 10 && x <= textElement.x + 100 &&
              y >= textElement.y - 20 && y <= textElement.y + 20) {
            clickedElement = element
            break
          }
        } else if ('width' in element && 'height' in element) {
          const rectElem = element as unknown as {
            x: number;
            y: number;
            width: number;
            height: number;
          }
          if (x >= rectElem.x && x <= rectElem.x + rectElem.width &&
              y >= rectElem.y && y <= rectElem.y + rectElem.height) {
            clickedElement = element
            break
          }
        }
      }
    }

    
    if (!clickedElement) {
      const clickedSection = sections.find(section => 
        x >= section.x && x <= section.x + section.width &&
        y >= section.y && y <= section.y + section.height
      )
      clickedElement = clickedSection || null
    }

    if (clickedElement) {
      setSelectedElement(clickedElement.id)
      if ('name' in clickedElement) {
        setIsEditingInPlace(true)
        setEditingText(clickedElement.name)
      } else if (clickedElement.type === 'text') {
        setIsEditingInPlace(true)
        setEditingText((clickedElement as TextElement).content)
      }
    }
  }

  const handleSave = async () => {
    try {
      await onSave(sections, elements)
      alert('Configuración de asientos guardada exitosamente!')
    } catch (error) {
      console.error('Error saving seating plan:', error)
      alert('Error al guardar la configuración')
    }
  }

  useEffect(() => {
    redraw()
  }, [redraw])

  
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      switch (tool) {
        case 'select': 
          canvas.style.cursor = 'default'
          break
        case 'hand':
          canvas.style.cursor = isDraggingElement ? 'grabbing' : 'grab'
          break
        case 'text': 
          canvas.style.cursor = 'text'
          break
        case 'polygon':
          canvas.style.cursor = isCreatingPolygon ? 'crosshair' : 'copy'
          break
        case 'polygonSection':
          canvas.style.cursor = 'crosshair'
          break
        case 'section':
        case 'stage':
        case 'entrance':
        case 'rectangle':
        case 'circle': 
          canvas.style.cursor = 'crosshair'
          break
        default: 
          canvas.style.cursor = 'default'
      }
    }
  }, [tool, isCreatingPolygon, isCreatingPolygonSection, isDraggingElement])

  // useEffect para manejar teclas de acceso rápido
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo procesar si no estamos editando texto
      if (isEditingInPlace) return

      switch (e.key) {
        case 'h':
        case 'H':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            setTool('hand')
          }
          break
        case 'v':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            setTool('select')
          }
          break
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
          }
          break
        case 'y':
        case 'Y':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            redo()
          }
          break
        case 'c':
        case 'C':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            copySelected()
          }
          break
        case 'v':
        case 'V':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            pasteFromClipboard()
          }
          break
        case 'Delete':
        case 'Backspace':
          if (selectedElement) {
            setElements(prev => prev.filter(e => e.id !== selectedElement))
            setSections(prev => prev.filter(s => s.id !== selectedElement))
            setSelectedElement(null)
            saveToHistory()
          }
          break
        case 'Enter':
          // Completar polígono si tiene al menos 3 puntos
          if (tool === 'polygon' && isCreatingPolygon && polygonPoints.length >= 3) {
            const newPolygon: Polygon = {
              id: currentPolygonId!,
              type: 'polygon',
              name: newElementName || `Polígono ${elements.filter(e => e.type === 'polygon').length + 1}`,
              points: [...polygonPoints],
              rotation: 0,
              color: newElementColor,
              strokeColor: newElementColor,
              strokeWidth: 2,
              filled: true
            }
            
            setElements(prev => [...prev, newPolygon])
            setSelectedElement(newPolygon.id)
            
            // Limpiar estado
            setIsCreatingPolygon(false)
            setPolygonPoints([])
            setCurrentPolygonId(null)
            setMousePosition(null)
          }
          // Completar sección polígono si tiene al menos 3 puntos
          else if (tool === 'polygonSection' && isCreatingPolygonSection && polygonSectionPoints.length >= 3) {
            const newPolygonSection: PolygonSection = {
              id: currentPolygonSectionId!,
              type: 'polygonSection',
              name: newSectionName || `Sección Polígono ${elements.filter(e => e.type === 'polygonSection').length + 1}`,
              points: [...polygonSectionPoints],
              rotation: 0,
              color: newSectionColor,
              capacity: 50, // Capacidad inicial por defecto
              seats: []
            }
            
            setElements(prev => [...prev, newPolygonSection])
            setSelectedElement(newPolygonSection.id)
            
            // Limpiar estado
            setIsCreatingPolygonSection(false)
            setPolygonSectionPoints([])
            setCurrentPolygonSectionId(null)
            setMousePosition(null)
          }
          break
        
        case 'Escape':
          // Cancelar creación de polígono
          if (isCreatingPolygon) {
            setIsCreatingPolygon(false)
            setPolygonPoints([])
            setCurrentPolygonId(null)
            setMousePosition(null)
          }
          if (isCreatingPolygonSection) {
            setIsCreatingPolygonSection(false)
            setPolygonSectionPoints([])
            setCurrentPolygonSectionId(null)
            setMousePosition(null)
          }
          // Deseleccionar elemento
          setSelectedElement(null)
          break
        
        case 'Delete':
        case 'Backspace':
          // Eliminar elemento seleccionado
          if (selectedElement) {
            setSections(prev => prev.filter(s => s.id !== selectedElement))
            setElements(prev => prev.filter(e => e.id !== selectedElement))
            setSelectedElement(null)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [tool, isCreatingPolygon, polygonPoints, currentPolygonId, newElementName, elements, newElementColor, isCreatingPolygonSection, polygonSectionPoints, currentPolygonSectionId, newSectionName, newSectionColor, selectedElement, isEditingInPlace, undo, redo, copySelected, pasteFromClipboard, saveToHistory, setSections, setElements, setSelectedElement, setTool])

  // Auto-guardar en historial cuando cambian sections o elements
  useEffect(() => {
    if (sections.length > 0 || elements.length > 0) {
      const timeoutId = setTimeout(() => {
        saveToHistory()
      }, 1000) // Guardar después de 1 segundo sin cambios
      
      return () => clearTimeout(timeoutId)
    }
  }, [sections, elements, saveToHistory])

  return (
    <div className="w-full h-full bg-background flex flex-col">
      {}
      <div className="flex items-center justify-between p-3 bg-background/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
        <div className="flex items-center gap-4">
          {}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <Button
              variant={tool === 'select' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('select')}
              className={tool === 'select' 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "hover:bg-muted-foreground/10"
              }
              title="Seleccionar y mover elementos"
            >
              <Move className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'hand' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('hand')}
              className={tool === 'hand' 
                ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-sm" 
                : "hover:bg-orange-600/10"
              }
              title="Herramienta de mano - Arrastrar elementos libremente"
            >
              <Hand className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border/50" />
            <Button
              variant={tool === 'section' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('section')}
              className={tool === 'section' 
                ? "bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] text-white" 
                : "hover:bg-[#CC66CC]/10"
              }
              title="Crear sección rectangular"
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'polygonSection' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setTool('polygonSection')
                setIsCreatingPolygonSection(false)
                setPolygonSectionPoints([])
                setCurrentPolygonSectionId(null)
              }}
              className={tool === 'polygonSection' 
                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white" 
                : "hover:bg-orange-600/10"
              }
              title="Crear sección poligonal irregular"
            >
              <Pentagon className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border/50" />
            <Button
              variant={tool === 'stage' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('stage')}
              className={tool === 'stage' 
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
                : "hover:bg-purple-600/10"
              }
              title="Agregar escenario"
            >
              <Theater className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'entrance' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('entrance')}
              className={tool === 'entrance' 
                ? "bg-gradient-to-r from-green-600 to-blue-600 text-white" 
                : "hover:bg-green-600/10"
              }
              title="Agregar entrada"
            >
              <DoorOpen className="w-4 h-4" />
            </Button>
          </div>

          {}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <Button
              variant={tool === 'rectangle' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('rectangle')}
              className={tool === 'rectangle' 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" 
                : "hover:bg-blue-600/10"
              }
              title="Dibujar rectángulo"
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'circle' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('circle')}
              className={tool === 'circle' 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" 
                : "hover:bg-blue-600/10"
              }
              title="Dibujar círculo"
            >
              <Circle className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'polygon' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setTool('polygon')
                setIsCreatingPolygon(false)
                setPolygonPoints([])
                setCurrentPolygonId(null)
              }}
              className={tool === 'polygon' 
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white" 
                : "hover:bg-emerald-600/10"
              }
              title="Dibujar polígono libre"
            >
              <Shapes className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'text' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('text')}
              className={tool === 'text' 
                ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white" 
                : "hover:bg-amber-600/10"
              }
              title="Agregar texto"
            >
              <Type className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className={sidebarVisible ? "bg-muted" : ""}
            title={sidebarVisible ? "Ocultar panel lateral" : "Mostrar panel lateral"}
          >
            {sidebarVisible ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </Button>
          
          <div className="w-px h-6 bg-border/50" />
          
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScale(prev => Math.max(0.1, prev - 0.1))}
              title="Alejar"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="px-3 py-1 text-sm font-medium min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
              title="Acercar"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="w-px h-6 bg-border/50" />
          
          {/* Controles de Simetría */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <Button
              variant={symmetryEnabled ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSymmetryEnabled(!symmetryEnabled)}
              className={symmetryEnabled 
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
                : "hover:bg-purple-600/10"
              }
              title="Activar/desactivar simetría"
            >
              <FlipHorizontal className="w-4 h-4" />
            </Button>
            {symmetryEnabled && (
              <>
                <Button
                  variant={symmetryAxis === 'vertical' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSymmetryAxis('vertical')}
                  className="text-xs px-2"
                  title="Simetría vertical"
                >
                  |
                </Button>
                <Button
                  variant={symmetryAxis === 'horizontal' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSymmetryAxis('horizontal')}
                  className="text-xs px-2"
                  title="Simetría horizontal"
                >
                  —
                </Button>
              </>
            )}
          </div>
          
          <div className="w-px h-6 bg-border/50" />
          
          {/* Herramientas Avanzadas */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Deshacer (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Rehacer (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={copySelected}
              disabled={selectedElements.length === 0}
              title="Copiar (Ctrl+C)"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={pasteFromClipboard}
              disabled={!clipboard}
              title="Pegar (Ctrl+V)"
            >
              <Clipboard className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="w-px h-6 bg-border/50" />
          
          {/* Panel de Capas */}
          <Button
            variant={showLayers ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowLayers(!showLayers)}
            title="Mostrar/ocultar capas"
          >
            <Layers className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className={showGrid ? "bg-muted" : ""}
            title="Mostrar/ocultar grilla"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-border/50" />
          
          <div className="w-px h-6 bg-border/50" />
          
          {/* Importar/Exportar */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const data = { sections, elements, layers }
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `venue-${Date.now()}.json`
                a.click()
                URL.revokeObjectURL(url)
              }}
              title="Exportar diseño"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.json'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                      try {
                        const data = JSON.parse(e.target?.result as string)
                        if (data.sections) setSections(data.sections)
                        if (data.elements) setElements(data.elements)
                        if (data.layers) setLayers(data.layers)
                        saveToHistory()
                      } catch {
                        alert('Error al cargar el archivo')
                      }
                    }
                    reader.readAsText(file)
                  }
                }
                input.click()
              }}
              title="Importar diseño"
            >
              <Upload className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      {}
      <div className="flex flex-1 h-0 bg-gradient-to-br from-[#0053CC]/5 via-[#01CBFE]/5 to-[#CC66CC]/5">
        {}
        {sidebarVisible && (
          <div className="w-[480px] transition-all duration-300 ease-in-out bg-background/95 backdrop-blur-sm border-r shadow-lg flex flex-col h-full">
            <div className="p-6 space-y-6 overflow-y-auto flex-1 max-h-full min-h-0 
                        [&::-webkit-scrollbar]:w-3 
                        [&::-webkit-scrollbar-track]:bg-transparent 
                        [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 
                        [&::-webkit-scrollbar-thumb]:rounded-full 
                        [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40
                        [&::-webkit-scrollbar-corner]:bg-transparent">
          {}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-base">
                <div className="w-8 h-8 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-lg flex items-center justify-center">
                  <MousePointer className="w-4 h-4 text-white" />
                </div>
                Herramienta Activa
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                {tool === 'select' && <Move className="w-5 h-5 text-primary" />}
                {tool === 'hand' && <Hand className="w-5 h-5 text-orange-600" />}
                {tool === 'section' && <Square className="w-5 h-5 text-[#CC66CC]" />}
                {tool === 'polygonSection' && <Pentagon className="w-5 h-5 text-orange-600" />}
                {tool === 'stage' && <Theater className="w-5 h-5 text-purple-600" />}
                {tool === 'entrance' && <DoorOpen className="w-5 h-5 text-green-600" />}
                {tool === 'rectangle' && <Square className="w-5 h-5 text-blue-600" />}
                {tool === 'circle' && <Circle className="w-5 h-5 text-blue-600" />}
                {tool === 'polygon' && <Shapes className="w-5 h-5 text-emerald-600" />}
                {tool === 'text' && <Type className="w-5 h-5 text-amber-600" />}
                <span className="text-sm font-medium">
                  {tool === 'select' && 'Seleccionar'}
                  {tool === 'hand' && 'Mano (Arrastrar)'}
                  {tool === 'section' && 'Sección Rectangular'}
                  {tool === 'polygonSection' && 'Sección Poligonal'}
                  {tool === 'stage' && 'Escenario'}
                  {tool === 'entrance' && 'Entrada'}
                  {tool === 'rectangle' && 'Rectángulo'}
                  {tool === 'circle' && 'Círculo'}
                  {tool === 'polygon' && 'Polígono'}
                  {tool === 'text' && 'Texto'}
                </span>
              </div>
              {}
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                {tool === 'select' && 'Click en elementos para seleccionar y editar'}
                {tool === 'hand' && 'Click y arrastra cualquier elemento para moverlo libremente'}
                {tool === 'section' && 'Arrastra para crear una sección rectangular'}
                {tool === 'polygonSection' && 'Click para crear puntos, doble click para finalizar. Define capacidad numérica.'}
                {tool === 'stage' && 'Arrastra para posicionar el escenario'}
                {tool === 'entrance' && 'Arrastra para crear una entrada'}
                {tool === 'rectangle' && 'Arrastra para dibujar un rectángulo'}
                {tool === 'circle' && 'Arrastra para dibujar un círculo'}
                {tool === 'polygon' && 'Click para crear puntos, doble click para finalizar'}
                {tool === 'text' && 'Click donde quieres agregar texto'}
              </p>
              <div className="mt-2 text-xs text-muted-foreground/70 bg-muted/30 p-2 rounded">
                💡 Atajos: V = Seleccionar, H = Mano, Ctrl+Z = Deshacer, Ctrl+Y = Rehacer
              </div>
            </CardContent>
          </Card>

          {/* Card de Simetría */}
          {symmetryEnabled && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <FlipHorizontal className="w-4 h-4 text-white" />
                  </div>
                  Modo Simetría Activo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">
                      Simetría {symmetryAxis === 'vertical' ? 'Vertical' : 'Horizontal'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    ✨ Los elementos que crees se duplicarán automáticamente en espejo {symmetryAxis === 'vertical' ? 'del lado opuesto' : 'arriba/abajo'}.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={symmetryAxis === 'vertical' ? 'default' : 'outline'}
                      onClick={() => setSymmetryAxis('vertical')}
                      className="flex-1"
                    >
                      Vertical |
                    </Button>
                    <Button
                      size="sm"
                      variant={symmetryAxis === 'horizontal' ? 'default' : 'outline'}
                      onClick={() => setSymmetryAxis('horizontal')}
                      className="flex-1"
                    >
                      Horizontal —
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Herramientas de Alineación */}
          {selectedElements.length > 1 && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600/10 to-blue-600/10 pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <AlignCenter className="w-4 h-4 text-white" />
                  </div>
                  Alineación ({selectedElements.length} elementos)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => alignElements('left')}
                    title="Alinear a la izquierda"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => alignElements('center')}
                    title="Alinear al centro"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => alignElements('right')}
                    title="Alinear a la derecha"
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {}
        {tool === 'stage' && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Theater className="w-4 h-4 text-white" />
                </div>
                Nuevo Escenario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="space-y-3">
                <Label htmlFor="stage-name" className="text-sm font-medium">Nombre del escenario</Label>
                <Input
                  id="stage-name"
                  value={newElementName}
                  onChange={(e) => setNewElementName(e.target.value)}
                  placeholder="Ej: Escenario Principal, Tarima VIP"
                  className="border-2 focus:border-purple-600 transition-colors h-10"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Color del escenario</Label>
                <div className="grid grid-cols-4 gap-3 mt-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      className={`w-12 h-12 rounded-xl border-2 transition-all hover:scale-105 ${
                        newElementColor === color ? 'border-foreground shadow-lg' : 'border-muted-foreground/30'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewElementColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  🎭 Arrastra en el lienzo para crear el escenario
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {}
        {tool === 'entrance' && (
          <Card className="mb-6 border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-600/10 to-blue-600/10 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <DoorOpen className="w-4 h-4 text-white" />
                </div>
                Nueva Entrada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="entrance-name" className="text-sm font-medium">Nombre de la entrada</Label>
                <Input
                  id="entrance-name"
                  value={newElementName}
                  onChange={(e) => setNewElementName(e.target.value)}
                  placeholder="Ej: Entrada Principal, Salida de Emergencia"
                  className="border-2 focus:border-green-600 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo de entrada</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(ENTRANCE_COLORS).map(([type, color]) => (
                    <Button
                      key={type}
                      variant={entranceType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setEntranceType(type as keyof typeof ENTRANCE_COLORS)}
                      className={entranceType === type 
                        ? `text-white border-0` 
                        : `border-2 transition-colors`
                      }
                      style={entranceType === type ? { background: color } : { borderColor: color }}
                    >
                      {type === 'main' ? '🚪 Principal' :
                       type === 'emergency' ? '🚨 Emergencia' :
                       type === 'vip' ? '⭐ VIP' : '🔧 Servicio'}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  🚪 Arrastra en el lienzo para crear la entrada
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {}
        {tool === 'text' && (
          <Card className="mb-6 border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Type className="w-4 h-4 text-white" />
                </div>
                Nuevo Texto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="text-content" className="text-sm font-medium">Contenido del texto</Label>
                <Input
                  id="text-content"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Ej: Camerinos, Baños, Información"
                  className="border-2 focus:border-blue-600 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Color del texto</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-xl border-2 transition-all hover:scale-105 ${
                        newElementColor === color ? 'border-foreground shadow-lg' : 'border-muted-foreground/30'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewElementColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  📝 Haz clic en el lienzo para colocar el texto
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {}
        {(tool === 'rectangle' || tool === 'circle') && (
          <Card className="mb-6 border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Shapes className="w-4 h-4 text-white" />
                </div>
                Nueva Forma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="shape-name" className="text-sm font-medium">Nombre de la forma</Label>
                <Input
                  id="shape-name"
                  value={newElementName}
                  onChange={(e) => setNewElementName(e.target.value)}
                  placeholder={`Ej: ${tool === 'rectangle' ? 'Mesa, Estructura' : 'Columna, Decoración'}`}
                  className="border-2 focus:border-blue-600 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Color de la forma</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-xl border-2 transition-all hover:scale-105 ${
                        newElementColor === color ? 'border-foreground shadow-lg' : 'border-muted-foreground/30'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewElementColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  {tool === 'rectangle' ? '⬜' : '⭕'} Arrastra en el lienzo para crear la forma
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {}
        {tool === 'polygon' && (
          <Card className="mb-6 border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Pentagon className="w-4 h-4 text-white" />
                </div>
                {isCreatingPolygon ? 'Creando Polígono' : 'Nuevo Polígono'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {isCreatingPolygon && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-purple-700 text-sm font-medium mb-2">
                    <Pentagon className="w-4 h-4" />
                    Polígono en progreso
                  </div>
                  <div className="text-xs text-purple-600 space-y-1">
                    <p>📍 Puntos: {polygonPoints.length}</p>
                    <p>🖱️ Click para agregar puntos</p>
                    <p>🖱️ Doble-click para finalizar (mínimo 3 puntos)</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="polygon-name" className="text-sm font-medium">Nombre del polígono</Label>
                <Input
                  id="polygon-name"
                  value={newElementName}
                  onChange={(e) => setNewElementName(e.target.value)}
                  placeholder="Ej: Área VIP, Zona especial"
                  className="border-2 focus:border-purple-600 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Color del polígono</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-xl border-2 transition-all hover:scale-105 ${
                        newElementColor === color ? 'border-foreground shadow-lg' : 'border-muted-foreground/30'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewElementColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  {isCreatingPolygon 
                    ? '🎯 Continúa haciendo click para agregar puntos, doble-click para finalizar'
                    : '🔺 Haz click en el lienzo para comenzar a crear puntos del polígono'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {}
        {isEditingInPlace && (() => {
          const element = elements.find(el => el.id === selectedElement);
          if (!element) return null;

          const isTextElement = element.type === 'text';
          const currentValue = isTextElement ? element.content : ('name' in element ? element.name : '');

          return (
            <Card className="mb-6 border-l-4 border-l-blue-500 shadow-lg bg-blue-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-blue-600" />
                  Editando {isTextElement ? 'texto' : 'nombre'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-input" className="text-sm font-medium">
                    {isTextElement ? 'Contenido del texto' : 'Nombre del elemento'}
                  </Label>
                  <Input
                    id="edit-input"
                    type="text"
                    value={currentValue}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setElements(prev => prev.map(el => {
                        if (el.id === selectedElement) {
                          if (isTextElement) {
                            return { ...el, content: newValue };
                          } else if ('name' in el) {
                            return { ...el, name: newValue };
                          }
                        }
                        return el;
                      }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsEditingInPlace(false);
                      } else if (e.key === 'Escape') {
                        setIsEditingInPlace(false);
                      }
                    }}
                    placeholder={isTextElement ? 'Escribe tu texto aquí...' : 'Nombre del elemento'}
                    className="text-sm"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => setIsEditingInPlace(false)}
                    className="flex-1"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Guardar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsEditingInPlace(false)}
                    className="flex-1"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancelar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Presiona Enter para guardar o Esc para cancelar
                </p>
              </CardContent>
            </Card>
          );
        })()}

        {}
        {selectedElement && !isEditingInPlace && (() => {
          const element = elements.find(el => el.id === selectedElement);
          if (!element) return null;

          const getName = (el: VenueElement): string => {
            if ('name' in el) return el.name;
            if (el.type === 'text') return el.content;
            return 'Sin nombre';
          };

          const getDimensions = (el: VenueElement): { width: number; height: number } => {
            if ('width' in el && 'height' in el) {
              return { width: el.width, height: el.height };
            }
            if (el.type === 'text') {
              return { width: el.fontSize * 6, height: el.fontSize * 1.2 }; 
            }
            return { width: 0, height: 0 };
          };

          return (
            <Card className="mb-6 border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-600/10 to-red-600/10 pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                      <Edit3 className="w-4 h-4 text-white" />
                    </div>
                    Elemento Seleccionado
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const newElements = elements.filter(el => el.id !== selectedElement);
                      setElements(newElements);
                      setSelectedElement(null);
                      
                      if (element.type === 'section') {
                        const newSections = sections.filter(s => s.id !== selectedElement);
                        setSections(newSections);
                        // Guardado automático se encarga del resto
                      } else {
                        // Si es un elemento (no sección), guardado automático se encarga del resto
                      }
                    }}
                    className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tipo de elemento</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    {element.type === 'stage' && (
                      <>
                        <Theater className="w-4 h-4 text-purple-600" />
                        <span className="text-sm">Escenario</span>
                      </>
                    )}
                    {element.type === 'entrance' && (
                      <>
                        <DoorOpen className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Entrada</span>
                      </>
                    )}
                    {element.type === 'text' && (
                      <>
                        <Type className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">Texto</span>
                      </>
                    )}
                    {(element.type === 'rectangle' || element.type === 'circle') && (
                      <>
                        <Shapes className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm">Forma</span>
                      </>
                    )}
                    {element.type === 'section' && (
                      <>
                        <Square className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">Sección</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {element.type === 'text' ? 'Contenido' : 'Nombre'}
                  </Label>
                  <p className="text-sm p-2 bg-muted rounded-lg">{getName(element)}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Posición</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">X</p>
                      <p className="text-sm font-mono">
                        {element.type === 'polygon' 
                          ? Math.round((element as Polygon).points.reduce((sum, p) => sum + p.x, 0) / (element as Polygon).points.length)
                          : Math.round((element as unknown as { x: number }).x)
                        }
                      </p>
                    </div>
                    <div className="p-2 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Y</p>
                      <p className="text-sm font-mono">
                        {element.type === 'polygon' 
                          ? Math.round((element as Polygon).points.reduce((sum, p) => sum + p.y, 0) / (element as Polygon).points.length)
                          : Math.round((element as unknown as { y: number }).y)
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {element.type === 'text' ? 'Tamaño estimado' : 'Dimensiones'}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Ancho</p>
                      <p className="text-sm font-mono">{Math.round(getDimensions(element).width)}</p>
                    </div>
                    <div className="p-2 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Alto</p>
                      <p className="text-sm font-mono">{Math.round(getDimensions(element).height)}</p>
                    </div>
                  </div>
                </div>

                {element.type === 'text' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Estilo de texto</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Tamaño</p>
                        <p className="text-sm font-mono">{element.fontSize}px</p>
                      </div>
                      <div className="p-2 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Peso</p>
                        <p className="text-sm font-mono">{element.fontWeight}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">
                    🗑️ Usa el botón rojo para eliminar este elemento
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })()}

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
              
              {}
              <div className="space-y-3 pt-2 border-t border-muted">
                <Label className="text-sm font-medium">Modo de creación</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={creationMode === 'manual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCreationMode('manual')}
                    className={creationMode === 'manual' 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0" 
                      : "border-2 hover:border-blue-600 transition-colors"
                    }
                  >
                    Manual
                  </Button>
                  <Button
                    variant={creationMode === 'bySeats' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCreationMode('bySeats')}
                    className={creationMode === 'bySeats' 
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0" 
                      : "border-2 hover:border-purple-600 transition-colors"
                    }
                  >
                    Por asientos
                  </Button>
                </div>
              </div>

              {}
              {creationMode === 'bySeats' && (
                <div className="space-y-3 pt-2 border-t border-muted">
                  <div className="space-y-2">
                    <Label htmlFor="desired-seats" className="text-sm font-medium">
                      Cantidad de asientos: {desiredSeats}
                    </Label>
                    <input
                      id="desired-seats"
                      type="range"
                      min="10"
                      max="500"
                      step="10"
                      value={desiredSeats}
                      onChange={(e) => setDesiredSeats(parseInt(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>10</span>
                      <span>500</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="seats-per-row" className="text-xs">Asientos por fila</Label>
                      <Input
                        id="seats-per-row"
                        type="number"
                        min="5"
                        max="50"
                        value={seatsPerRow}
                        onChange={(e) => setSeatsPerRow(parseInt(e.target.value) || 10)}
                        className="text-sm h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="seat-spacing" className="text-xs">Espaciado (px)</Label>
                      <Input
                        id="seat-spacing"
                        type="number"
                        min="25"
                        max="60"
                        value={seatSpacing}
                        onChange={(e) => setSeatSpacing(parseInt(e.target.value) || 35)}
                        className="text-sm h-8"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Asientos:</span>
                        <span className="font-medium">{desiredSeats}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Filas:</span>
                        <span className="font-medium">{Math.ceil(desiredSeats / seatsPerRow)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dimensiones:</span>
                        <span className="font-medium">
                          {calculateOptimalDimensions(desiredSeats, seatsPerRow, seatSpacing, rowSpacing).width}×{calculateOptimalDimensions(desiredSeats, seatsPerRow, seatSpacing, rowSpacing).height}px
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  {creationMode === 'bySeats' 
                    ? '🎯 Haz click en el lienzo para crear la sección con la cantidad exacta de asientos'
                    : '💡 Arrastra en el lienzo para crear la sección'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {}
        {tool === 'polygonSection' && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-600/10 to-red-600/10 pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                  <Pentagon className="w-4 h-4 text-white" />
                </div>
                Sección Poligonal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="space-y-3">
                <Label htmlFor="polygon-section-name" className="text-sm font-medium">Nombre de la sección</Label>
                <Input
                  id="polygon-section-name"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="Ej: Palco Lateral, VIP Especial"
                  className="border-2 focus:border-orange-600 transition-colors h-10"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Color de la sección</Label>
                <div className="grid grid-cols-4 gap-3 mt-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      className={`w-12 h-12 rounded-xl border-2 transition-all hover:scale-105 ${
                        newSectionColor === color ? 'border-foreground shadow-lg' : 'border-muted-foreground/30'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewSectionColor(color)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-3 pt-2 border-t border-muted">
                <div className="space-y-2">
                  <Label htmlFor="polygon-desired-seats" className="text-sm font-medium">
                    Cantidad de asientos: {desiredSeats}
                  </Label>
                  <input
                    id="polygon-desired-seats"
                    type="range"
                    min="10"
                    max="300"
                    step="5"
                    value={desiredSeats}
                    onChange={(e) => setDesiredSeats(parseInt(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10</span>
                    <span>300</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="polygon-spacing" className="text-xs">Espaciado (px)</Label>
                    <Input
                      id="polygon-spacing"
                      type="number"
                      min="25"
                      max="60"
                      value={seatSpacing}
                      onChange={(e) => setSeatSpacing(parseInt(e.target.value) || 35)}
                      className="text-sm h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="polygon-row-spacing" className="text-xs">Separación filas</Label>
                    <Input
                      id="polygon-row-spacing"
                      type="number"
                      min="30"
                      max="80"
                      value={rowSpacing}
                      onChange={(e) => setRowSpacing(parseInt(e.target.value) || 40)}
                      className="text-sm h-8"
                    />
                  </div>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Asientos objetivo:</span>
                      <span className="font-medium">{desiredSeats}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Espaciado:</span>
                      <span className="font-medium">{seatSpacing}px</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <p className="text-xs text-orange-800">
                  {isCreatingPolygonSection 
                    ? '🔸 Haz click para agregar puntos al polígono. Doble click para finalizar'
                    : '🔸 Haz click en el lienzo para comenzar a crear el polígono'
                  }
                </p>
                {polygonSectionPoints.length > 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    Puntos actuales: {polygonSectionPoints.length} (mínimo 3 para cerrar)
                  </p>
                )}
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
                      selectedElement === section.id 
                        ? 'border-[#0053CC] bg-gradient-to-r from-[#0053CC]/10 to-[#01CBFE]/10 shadow-lg' 
                        : 'border-muted hover:border-[#0053CC]/50'
                    }`}
                    onClick={() => setSelectedElement(section.id)}
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

        {}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                <Pentagon className="w-4 h-4 text-white" />
              </div>
              Secciones Poligonales
              {elements.filter(e => e.type === 'polygonSection').length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {elements.filter(e => e.type === 'polygonSection').length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            {elements.filter(e => e.type === 'polygonSection').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Pentagon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No hay secciones poligonales creadas</p>
                <p className="text-xs mt-2 leading-relaxed">Selecciona &quot;Sección Polígono&quot; y dibuja en el lienzo</p>
              </div>
            ) : (
              <div className="space-y-4">
                {elements
                  .filter(e => e.type === 'polygonSection')
                  .map(polygonSection => (
                    <div
                      key={polygonSection.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                        selectedElement === polygonSection.id 
                          ? 'border-orange-600 bg-gradient-to-r from-orange-600/10 to-red-600/10 shadow-lg' 
                          : 'border-muted hover:border-orange-600/50'
                      }`}
                      onClick={() => setSelectedElement(polygonSection.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg shadow-sm flex items-center justify-center"
                            style={{ backgroundColor: polygonSection.color }}
                          >
                            <Pentagon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="font-semibold text-base">{polygonSection.name}</span>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="font-medium">{polygonSection.capacity || 0} asientos</span>
                              <span>•</span>
                              <span>{polygonSection.points.length} puntos</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Capacidad:</span>
                            <input
                              type="number"
                              min="0"
                              max="9999"
                              value={polygonSection.capacity || 0}
                              onChange={(e) => {
                                const capacity = parseInt(e.target.value) || 0
                                setElements(prev => prev.map(el => 
                                  el.id === polygonSection.id && el.type === 'polygonSection'
                                    ? { ...el, capacity }
                                    : el
                                ))
                              }}
                              className="w-20 h-8 px-2 text-sm border rounded-md"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              setElements(prev => prev.filter(el => el.id !== polygonSection.id))
                            }}
                            className="h-8 w-8 p-0 border-2 hover:border-red-500 hover:text-red-600"
                            title="Eliminar sección poligonal"
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

        {/* Panel de Capas */}
        {showLayers && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                Capas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-3">
                {layers.map(layer => (
                  <div
                    key={layer.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setLayers(prev => 
                        prev.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l)
                      )}
                      className="h-6 w-6 p-0"
                    >
                      {layer.visible ? '👁️' : '🙈'}
                    </Button>
                    <span className="flex-1 text-sm font-medium">{layer.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setLayers(prev => 
                        prev.map(l => l.id === layer.id ? { ...l, locked: !l.locked } : l)
                      )}
                      className="h-6 w-6 p-0"
                    >
                      {layer.locked ? '🔒' : '🔓'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-[#01CBFE] to-[#CC66CC] rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              Leyenda de asientos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div className="flex items-center gap-4 text-sm">
              <div className="w-5 h-5 rounded-full bg-green-500 shadow-sm"></div>
              <span>Asientos disponibles</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="w-5 h-5 rounded-full bg-red-500 shadow-sm"></div>
              <span>Asientos bloqueados</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="w-5 h-5 rounded-full bg-amber-500 shadow-sm"></div>
              <span>En mantenimiento</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="w-5 h-5 rounded border-2 border-blue-500 bg-blue-50"></div>
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
          
          {/* Indicador visual de scroll */}
          <div className="mt-8 pt-4 border-t border-border/50">
            <div className="text-center text-muted-foreground">
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-full text-xs">
                <div className="w-2 h-2 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-full animate-pulse"></div>
                Editor Visual de Venues
              </div>
            </div>
          </div>
        </div>
            </div>
          </div>
        )}

        {}
        <div className={`${
          sidebarVisible ? 'flex-1' : 'w-full'
        } transition-all duration-300 ease-in-out relative bg-background`}>
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          className="border-0 bg-background shadow-inner"
          onMouseDown={handleMouseDown}
          onMouseMove={(e) => {
            handleMouseMove(e)
            
            const canvas = canvasRef.current
            if (canvas) {
              canvas.style.cursor = getCursor(e.nativeEvent)
            }
          }}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
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

        {/* Panel de instrucciones para polígonos */}
        {(isCreatingPolygon || isCreatingPolygonSection) && (
          <div className="absolute top-6 right-6 bg-blue-500/95 backdrop-blur-sm p-4 rounded-xl border-0 shadow-lg text-white max-w-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="font-medium">
                  {isCreatingPolygon ? 'Creando Polígono' : 'Creando Sección Polígono'}
                </span>
              </div>
              
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-blue-200">Puntos:</span>
                  <span className="font-medium">
                    {(isCreatingPolygon ? polygonPoints.length : polygonSectionPoints.length)} / mín. 3
                  </span>
                </div>
                
                <div className="space-y-1 text-xs">
                  <div>• Clic para agregar punto</div>
                  <div>• Clic cerca del primer punto para cerrar</div>
                  <div>• Doble clic para terminar</div>
                  <div>• <kbd className="bg-white/20 px-1 rounded">Enter</kbd> para completar</div>
                  <div>• <kbd className="bg-white/20 px-1 rounded">Esc</kbd> para cancelar</div>
                </div>
              </div>
              
              {(polygonPoints.length >= 3 || polygonSectionPoints.length >= 3) && (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-xs flex-1"
                    onClick={() => {
                      if (isCreatingPolygon && polygonPoints.length >= 3) {
                        const newPolygon: Polygon = {
                          id: currentPolygonId!,
                          type: 'polygon',
                          name: newElementName || `Polígono ${elements.filter(e => e.type === 'polygon').length + 1}`,
                          points: [...polygonPoints],
                          rotation: 0,
                          color: newElementColor,
                          strokeColor: newElementColor,
                          strokeWidth: 2,
                          filled: true
                        }
                        
                        setElements(prev => [...prev, newPolygon])
                        setSelectedElement(newPolygon.id)
                        setIsCreatingPolygon(false)
                        setPolygonPoints([])
                        setCurrentPolygonId(null)
                        setMousePosition(null)
                      }
                    }}
                  >
                    ✓ Completar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      if (isCreatingPolygon) {
                        setIsCreatingPolygon(false)
                        setPolygonPoints([])
                        setCurrentPolygonId(null)
                        setMousePosition(null)
                      }
                      if (isCreatingPolygonSection) {
                        setIsCreatingPolygonSection(false)
                        setPolygonSectionPoints([])
                        setCurrentPolygonSectionId(null)
                        setMousePosition(null)
                      }
                    }}
                  >
                    ✕ Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

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

        {/* Indicador de Estado */}
        <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Editor Activo</span>
            </div>
            <div className="w-px h-4 bg-border"></div>
            <span className="text-muted-foreground">
              {sections.length + elements.length} elementos
            </span>
            {historyIndex >= 0 && (
              <>
                <div className="w-px h-4 bg-border"></div>
                <span className="text-muted-foreground">
                  Historial: {historyIndex + 1}/{history.length}
                </span>
              </>
            )}
            {selectedElements.length > 0 && (
              <>
                <div className="w-px h-4 bg-border"></div>
                <span className="text-blue-600 font-medium">
                  {selectedElements.length} seleccionado{selectedElements.length > 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
