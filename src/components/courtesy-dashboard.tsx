'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Gift, 
  Check, 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  Mail,
  User,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CourtesyRequest {
  id: string;
  name: string;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'USED' | 'EXPIRED';
  createdAt: string;
  approvedAt?: string;
  usedAt?: string;
  code?: string;
  codeType?: 'FREE' | 'DISCOUNT';
  discountValue?: number;
}

interface EventInfo {
  id: string;
  title: string;
  allowCourtesy: boolean;
  courtesyLimit?: number;
  usedCourtesies: number;
}

interface CourtesyDashboardProps {
  eventId: string;
}

export function CourtesyDashboard({ eventId }: CourtesyDashboardProps) {
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [requests, setRequests] = useState<CourtesyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  
  // Estados para aprobar solicitud
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvalType, setApprovalType] = useState<'FREE' | 'DISCOUNT'>('FREE');
  const [discountAmount, setDiscountAmount] = useState<string>('');

  const fetchCourtesyRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}/courtesy`);
      
      if (!response.ok) {
        throw new Error('Error al cargar solicitudes');
      }

      const data = await response.json();
      setEventInfo(data.event);
      setRequests(data.requests);
    } catch (error) {
      toast.error('Error al cargar solicitudes de cortesía');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchCourtesyRequests();
  }, [fetchCourtesyRequests]);

  const handleApprove = async (requestId: string) => {
    if (approvalType === 'DISCOUNT') {
      const discountValue = parseFloat(discountAmount);
      if (!discountAmount || discountValue <= 0 || discountValue > 100) {
        toast.error('Ingresa un monto de descuento válido (1-100%)');
        return;
      }
    }

    setProcessingIds(prev => new Set([...prev, requestId]));

    try {
      const response = await fetch(`/api/events/${eventId}/courtesy/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'APPROVE',
          codeType: approvalType,
          discountValue: approvalType === 'DISCOUNT' ? parseFloat(discountAmount) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error response:', error);
        throw new Error(error.details || error.error || 'Error al aprobar solicitud');
      }

      const data = await response.json();
      toast.success(`Solicitud aprobada. Código: ${data.code}`);
      
      // Refrescar la lista
      await fetchCourtesyRequests();
      setApprovingId(null);
      setDiscountAmount('');
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al aprobar solicitud');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingIds(prev => new Set([...prev, requestId]));

    try {
      const response = await fetch(`/api/events/${eventId}/courtesy/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'REJECT',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error response:', error);
        throw new Error(error.details || error.error || 'Error al rechazar solicitud');
      }

      toast.success('Solicitud rechazada');
      await fetchCourtesyRequests();
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al rechazar solicitud');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: CourtesyRequest['status']) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Aprobada</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Rechazada</Badge>;
      case 'USED':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><Gift className="h-3 w-3 mr-1" />Usada</Badge>;
      case 'EXPIRED':
        return <Badge variant="outline" className="text-gray-600 border-gray-600"><AlertCircle className="h-3 w-3 mr-1" />Expirada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!eventInfo) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar información del evento.
        </AlertDescription>
      </Alert>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const approvedRequests = requests.filter(r => r.status === 'APPROVED' || r.status === 'USED');

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Aprobadas</p>
                <p className="text-2xl font-bold">{approvedRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Usadas</p>
                <p className="text-2xl font-bold">{requests.filter(r => r.status === 'USED').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Límite</p>
                <p className="text-2xl font-bold">
                  {eventInfo.courtesyLimit || '∞'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de solicitudes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Solicitudes de Cortesía
          </CardTitle>
          <CardDescription>
            Gestiona las solicitudes de cortesía para {eventInfo.title}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay solicitudes de cortesía para este evento.
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{request.name}</span>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {request.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(request.createdAt), 'dd MMM yyyy, HH:mm', { locale: es })}
                        </div>
                      </div>

                      {request.code && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono">
                            {request.code}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {request.codeType === 'FREE' ? 'Entrada gratuita' : `Descuento $${request.discountValue}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {request.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setApprovingId(request.id)}
                          disabled={processingIds.has(request.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(request.id)}
                          disabled={processingIds.has(request.id)}
                        >
                          {processingIds.has(request.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4 mr-1" />
                          )}
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Modal de aprobación */}
                  {approvingId === request.id && (
                    <div className="mt-4 p-4 border-t bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                      <div className="space-y-4">
                        <div>
                          <Label>Tipo de cortesía</Label>
                          <Select value={approvalType} onValueChange={(value: 'FREE' | 'DISCOUNT') => setApprovalType(value)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FREE">Entrada gratuita</SelectItem>
                              <SelectItem value="DISCOUNT">Descuento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {approvalType === 'DISCOUNT' && (
                          <div>
                            <Label>Monto de descuento (CLP)</Label>
                            <Input
                              type="number"
                              value={discountAmount}
                              onChange={(e) => setDiscountAmount(e.target.value)}
                              placeholder="Ej: 5000"
                              min="0"
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(request.id)}
                            disabled={processingIds.has(request.id)}
                            size="sm"
                          >
                            {processingIds.has(request.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <Check className="h-4 w-4 mr-1" />
                            )}
                            Confirmar Aprobación
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setApprovingId(null)}
                            size="sm"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
