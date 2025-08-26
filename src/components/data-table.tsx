"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  Eye, 
  Edit, 
  UserCheck,
  Users,
  Calendar,
  Ticket,
  DollarSign,
  TrendingUp,
  Activity,
  Shield,
  Settings,
  BarChart3,
  Star,
  Zap,
  Award,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Building,
  Globe,
  Mail,
  RefreshCw,
  Sparkles,
  Target,
  Layers,
  PieChart,
  LineChart,
  Filter,
  Download,
  Bell
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mapeo de iconos para convertir strings a componentes
const iconMap = {
  Eye,
  Edit,
  UserCheck,
  Users,
  Calendar,
  Ticket,
  DollarSign,
  TrendingUp,
  Activity,
  Shield,
  Settings,
  BarChart3,
  Star,
  Zap,
  Award,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Building,
  Globe,
  Mail,
  RefreshCw,
  Sparkles,
  Target,
  Layers,
  PieChart,
  LineChart,
  Filter,
  Download,
  Bell,
  MoreHorizontal,
  ArrowUpDown
} as const

type IconName = keyof typeof iconMap

interface DataTableProps<T> {
  title: string
  description?: string
  data: T[]
  columns: Array<{
    key: keyof T
    label: string
    sortable?: boolean
    render?: (value: T[keyof T], item: T) => React.ReactNode
  }>
  actions?: Array<{
    label: string
    icon?: IconName
    onClick: (item: T) => void
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  }>
}

export function DataTable<T extends Record<string, unknown>>({
  title,
  description,
  data,
  columns,
  actions = []
}: DataTableProps<T>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)} className="font-medium">
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead className="text-right">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
                {columns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {column.render 
                      ? column.render(item[column.key], item)
                      : String(item[column.key] || "-")
                    }
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {actions.map((action, actionIndex) => {
                          const IconComponent = action.icon ? iconMap[action.icon] : null
                          return (
                            <DropdownMenuItem
                              key={actionIndex}
                              onClick={() => action.onClick(item)}
                              className="cursor-pointer"
                            >
                              {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                              {action.label}
                            </DropdownMenuItem>
                          )
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// Componente específico para eventos recientes
interface RecentEvent extends Record<string, unknown> {
  id: string
  title: string
  organizer: string
  date: string
  status: "published" | "draft" | "cancelled"
  revenue: number
  tickets: number
}

export function RecentEventsTable({ events }: { events: RecentEvent[] }) {
  const getStatusBadge = (status: RecentEvent["status"]) => {
    const variants = {
      published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    }
    
    const labels = {
      published: "Publicado",
      draft: "Borrador",
      cancelled: "Cancelado"
    }

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount)
  }

  return (
    <DataTable
      title="Eventos Recientes"
      description="Una lista de los eventos más recientes en la plataforma"
      data={events}
      columns={[
        {
          key: "title",
          label: "Evento",
          render: (value) => (
            <div className="font-medium">{String(value)}</div>
          )
        },
        {
          key: "organizer",
          label: "Organizador",
          render: (value) => (
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs">
                  {String(value).split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{String(value)}</span>
            </div>
          )
        },
        {
          key: "date",
          label: "Fecha",
          sortable: true
        },
        {
          key: "status",
          label: "Estado",
          render: (value) => getStatusBadge(value as RecentEvent["status"])
        },
        {
          key: "revenue",
          label: "Ingresos",
          render: (value) => (
            <div className="font-medium">{formatCurrency(Number(value))}</div>
          )
        },
        {
          key: "tickets",
          label: "Tickets",
          render: (value) => (
            <div className="text-center">{String(value)}</div>
          )
        }
      ]}
      actions={[
        {
          label: "Ver detalles",
          icon: "Eye",
          onClick: (item) => console.log("Ver", item.id)
        },
        {
          label: "Editar",
          icon: "Edit",
          onClick: (item) => console.log("Editar", item.id)
        }
      ]}
    />
  )
}
