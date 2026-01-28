'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCheckout } from '../checkout-context'
import { AlertCircle, User, Mail, Phone, IdCard, CheckCircle2, Bell } from 'lucide-react'

export function Step3BuyerInfo() {
  const { checkoutData, updateBuyerInfo } = useCheckout()

  const [formData, setFormData] = useState(checkoutData.buyerInfo)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validar campos en tiempo real
  useEffect(() => {
    const newErrors: Record<string, string> = {}

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (formData.phone && !/^(\+?56)?[2-9]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Teléfono inválido (debe ser un número chileno válido)'
    }

    setErrors(newErrors)
  }, [formData.email, formData.phone])

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    updateBuyerInfo(newFormData)
  }

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.phone.trim() !== '' &&
      Object.keys(errors).length === 0
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Información del Comprador</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                Completa tus datos para recibir tus tickets
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Personal Information */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Datos Personales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Juan"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Apellido <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="juan.perez@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+56 9 1234 5678"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
            <p className="text-xs text-gray-500">
              Este número será usado para notificaciones importantes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Document Information (Optional) */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <IdCard className="h-5 w-5" />
            Documento de Identidad
            <Badge variant="outline" className="ml-2">Opcional</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de Documento</Label>
              <Select
                value={formData.documentType || ''}
                onValueChange={(value) =>
                  handleInputChange('documentType', value as 'dni' | 'passport' | 'other')
                }
              >
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dni">RUT / DNI</SelectItem>
                  <SelectItem value="passport">Pasaporte</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Document Number */}
            <div className="space-y-2">
              <Label htmlFor="documentNumber">Número de Documento</Label>
              <Input
                id="documentNumber"
                type="text"
                placeholder="12.345.678-9"
                value={formData.documentNumber || ''}
                onChange={(e) => handleInputChange('documentNumber', e.target.value)}
              />
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta información es opcional pero puede ser requerida para algunos eventos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferencias de Notificación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>¿Cómo deseas recibir tus tickets y notificaciones?</Label>
          <RadioGroup
            value={formData.notificationPreference || 'email'}
            onValueChange={(value) =>
              handleInputChange('notificationPreference', value as 'email' | 'whatsapp' | 'both')
            }
          >
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <RadioGroupItem value="email" id="notif-email" />
              <Label htmlFor="notif-email" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Solo Email</p>
                    <p className="text-xs text-gray-500">
                      Recibirás tus tickets por correo electrónico
                    </p>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <RadioGroupItem value="whatsapp" id="notif-whatsapp" />
              <Label htmlFor="notif-whatsapp" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Solo WhatsApp</p>
                    <p className="text-xs text-gray-500">
                      Recibirás tus tickets por WhatsApp
                    </p>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <RadioGroupItem value="both" id="notif-both" />
              <Label htmlFor="notif-both" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Email y WhatsApp</p>
                    <p className="text-xs text-gray-500">
                      Recibirás notificaciones por ambos medios
                    </p>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {isFormValid() ? (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Información Completa
                </p>
                <p className="text-lg font-semibold mt-1">
                  Puedes continuar al siguiente paso
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor completa todos los campos obligatorios (*) para continuar
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
