'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Gift, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CourtesyRequestFormProps {
  eventId: string;
  eventTitle: string;
  isCourtesyEnabled: boolean;
  courtesyLimit?: number;
  usedCourtesies?: number;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  rut: string;
  email: string;
  phone: string;
}

export function CourtesyRequestForm({ 
  eventId, 
  eventTitle, 
  isCourtesyEnabled,
  courtesyLimit,
  usedCourtesies = 0,
  onSuccess
}: CourtesyRequestFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    rut: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const hasAvailableSlots = !courtesyLimit || usedCourtesies < courtesyLimit;
  const remainingSlots = courtesyLimit ? courtesyLimit - usedCourtesies : null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const formatRut = (rut: string) => {
    
    const cleanRut = rut.replace(/[^0-9kK]/g, '');
    
    if (cleanRut.length <= 1) return cleanRut;
    
    
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);
    
    
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${formattedBody}-${dv}`;
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setFormData(prev => ({
      ...prev,
      rut: formatted
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.rut.trim() || formData.rut.length < 8) {
      setError('RUT inválido');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Email inválido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/courtesy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          rut: formData.rut.replace(/[.-]/g, ''), 
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar solicitud');
      }

      setIsSubmitted(true);
      toast.success('Solicitud enviada exitosamente');
      onSuccess?.(); 
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar solicitud';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCourtesyEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Sistema de Cortesía
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Este evento no tiene cortesías disponibles.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!hasAvailableSlots) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Sistema de Cortesía
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No hay cupos de cortesía disponibles para este evento.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Solicitud Enviada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Tu solicitud de cortesía ha sido enviada exitosamente. 
              Te notificaremos por email cuando sea revisada.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Solicitar Cortesía
        </CardTitle>
        <CardDescription>
          Solicita una cortesía para {eventTitle}
          {remainingSlots && (
            <span className="block text-sm text-muted-foreground mt-1">
              Cupos disponibles: {remainingSlots}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Tu nombre completo"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rut">RUT *</Label>
            <Input
              id="rut"
              name="rut"
              type="text"
              value={formData.rut}
              onChange={handleRutChange}
              placeholder="12.345.678-9"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (Opcional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+56 9 1234 5678"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Solicitud'
            )}
          </Button>

          <div className="text-sm text-muted-foreground">
            <p>
              * Tu solicitud será revisada por el organizador del evento. 
              Te notificaremos por email si es aprobada.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
