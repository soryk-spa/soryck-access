'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Hash,
  Calendar,
  MapPin,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { formatFullDateTime } from '@/lib/date-utils';

interface TicketScannerProps {
  eventId: string;
  eventTitle: string;
  onScanResult?: (result: ScanResult) => void;
}

interface ScanResult {
  success: boolean;
  message: string;
  ticket?: {
    id: string;
    qrCode: string;
    isUsed: boolean;
    usedAt?: string;
    user: {
      id: string;
      firstName: string;
      lastName?: string;
      email: string;
    };
    order?: {
      id: string;
      orderNumber: string;
      totalAmount: number;
    };
    courtesyInvitation?: {
      id: string;
      invitedName?: string;
      invitedEmail: string;
      status: string;
    };
  };
  event?: {
    id: string;
    title: string;
    startDate: string;
    location: string;
  };
  scannedBy?: {
    id: string;
    name: string;
    email: string;
  };
  status: 'SUCCESS' | 'ALREADY_USED' | 'INACTIVE' | 'EVENT_ENDED' | 'ERROR';
}

interface ScanStats {
  eventId: string;
  eventTitle: string;
  tickets: {
    total: number;
    used: number;
    unused: number;
    usagePercentage: number;
  };
  courtesy: {
    total: number;
    pending: number;
    sent: number;
    accepted: number;
    expired: number;
  };
  lastUpdated: string;
}

export default function TicketScanner({ eventId, eventTitle, onScanResult }: TicketScannerProps) {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const [stats, setStats] = useState<ScanStats | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/scan`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [eventId]);

  useEffect(() => {
    fetchStats();
    // Auto-focus en el input para facilitar el escaneo manual
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [fetchStats]);

  const scanTicket = async (qrCode: string) => {
    if (!qrCode.trim()) {
      toast.error('Código QR requerido');
      return;
    }

    setIsScanning(true);
    try {
      const response = await fetch(`/api/events/${eventId}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: qrCode.trim() }),
      });

      const result = await response.json();
      
      const scanResult: ScanResult = {
        success: response.ok,
        message: result.message || result.error,
        ticket: result.ticket,
        event: result.event,
        scannedBy: result.scannedBy,
        status: result.status || (response.ok ? 'SUCCESS' : 'ERROR'),
      };

      setLastScanResult(scanResult);
      
      if (response.ok) {
        toast.success('Ticket validado exitosamente');
        fetchStats(); // Actualizar estadísticas
      } else {
        toast.error(result.error || 'Error al validar ticket');
      }

      onScanResult?.(scanResult);

    } catch (error) {
      console.error('Error scanning ticket:', error);
      const errorResult: ScanResult = {
        success: false,
        message: 'Error de conexión',
        status: 'ERROR',
      };
      setLastScanResult(errorResult);
      toast.error('Error de conexión');
    } finally {
      setIsScanning(false);
      setManualCode('');
      // Volver a enfocar el input para el siguiente escaneo
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleManualScan = () => {
    scanTicket(manualCode);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualScan();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ALREADY_USED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'INACTIVE':
      case 'EVENT_ENDED':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'border-green-200 bg-green-50';
      case 'ALREADY_USED':
        return 'border-red-200 bg-red-50';
      case 'INACTIVE':
      case 'EVENT_ENDED':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <QrCode className="w-6 h-6" />
          Escáner de Tickets
        </h2>
        <p className="text-muted-foreground">
          Escanea tickets para {eventTitle}
        </p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Tickets Usados</p>
                  <p className="text-2xl font-bold">{stats.tickets.used}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Tickets Restantes</p>
                  <p className="text-2xl font-bold">{stats.tickets.unused}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.tickets.total}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.tickets.usagePercentage}% utilizado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Escáner Manual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Escaneo Manual
          </CardTitle>
          <CardDescription>
            Introduce o pega el código QR manualmente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Código QR del ticket..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyPress={handleKeyPress}
              className="font-mono"
              disabled={isScanning}
            />
            <Button 
              onClick={handleManualScan}
              disabled={!manualCode.trim() || isScanning}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  Escanear
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado del último escaneo */}
      {lastScanResult && (
        <Card className={`border-2 ${getStatusColor(lastScanResult.status)}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(lastScanResult.status)}
              Resultado del Escaneo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                {lastScanResult.message}
              </AlertDescription>
            </Alert>

            {lastScanResult.ticket && (
              <div className="space-y-3">
                {/* Información del ticket */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Información del Ticket</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        <span className="font-mono">{lastScanResult.ticket.qrCode}</span>
                      </div>
                      {lastScanResult.ticket.order && (
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          <span>Orden: {lastScanResult.ticket.order.orderNumber}</span>
                        </div>
                      )}
                      {lastScanResult.ticket.isUsed && lastScanResult.ticket.usedAt && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Usado: {formatFullDateTime(lastScanResult.ticket.usedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Información del Asistente</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          {lastScanResult.ticket.courtesyInvitation?.invitedName ||
                           `${lastScanResult.ticket.user.firstName} ${lastScanResult.ticket.user.lastName || ''}`.trim()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>
                          {lastScanResult.ticket.courtesyInvitation?.invitedEmail ||
                           lastScanResult.ticket.user.email}
                        </span>
                      </div>
                      {lastScanResult.ticket.courtesyInvitation && (
                        <Badge variant="secondary" className="mt-1">
                          Invitación de Cortesía
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información del evento */}
                {lastScanResult.event && (
                  <div>
                    <h4 className="font-semibold mb-2">Información del Evento</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatFullDateTime(lastScanResult.event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{lastScanResult.event.location}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Información del escáner */}
                {lastScanResult.scannedBy && (
                  <div>
                    <h4 className="font-semibold mb-2">Validado por</h4>
                    <div className="text-sm">
                      <span>{lastScanResult.scannedBy.name} ({lastScanResult.scannedBy.email})</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estadísticas de cortesías */}
      {stats?.courtesy && stats.courtesy.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Invitaciones de Cortesía
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{stats.courtesy.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.courtesy.accepted}</p>
                <p className="text-sm text-muted-foreground">Aceptadas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.courtesy.sent}</p>
                <p className="text-sm text-muted-foreground">Enviadas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{stats.courtesy.pending}</p>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
