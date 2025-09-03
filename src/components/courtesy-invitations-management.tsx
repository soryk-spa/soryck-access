'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Mail,
  MoreHorizontal,
  Plus,
  Send,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Download,
} from 'lucide-react';
import { formatFullDateTime } from '@/lib/date-utils';

interface CourtesyInvitation {
  id: string;
  invitedEmail: string;
  invitedName?: string;
  status: 'PENDING' | 'SENT' | 'ACCEPTED' | 'EXPIRED';
  sentAt?: string;
  acceptedAt?: string;
  expiresAt?: string;
  createdAt: string;
  ticket?: {
    id: string;
    qrCode: string;
    isUsed: boolean;
    usedAt?: string;
  };
  creator?: {
    firstName: string;
    lastName?: string;
    email: string;
  };
}

interface CourtesyInvitationsManagementProps {
  eventId: string;
  eventTitle: string;
}

export default function CourtesyInvitationsManagement({
  eventId,
  eventTitle,
}: CourtesyInvitationsManagementProps) {
  const [invitations, setInvitations] = useState<CourtesyInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingInvitation, setIsAddingInvitation] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Form states
  const [singleEmail, setSingleEmail] = useState('');
  const [singleName, setSingleName] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');

  const fetchInvitations = useCallback(async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/invitations`);
      if (response.ok) {
        const data = await response.json();
        // La API devuelve { event, invitations }, extraer solo las invitaciones
        if (data.invitations && Array.isArray(data.invitations)) {
          setInvitations(data.invitations);
        } else {
          console.error('La respuesta de la API no contiene invitaciones como array:', data);
          setInvitations([]);
          toast.error('Error en el formato de datos de invitaciones');
        }
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Error al cargar invitaciones');
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Error al cargar las invitaciones');
      setInvitations([]); // Asegurar que sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const addSingleInvitation = async () => {
    if (!singleEmail.trim()) {
      toast.error('El email es requerido');
      return;
    }

    setIsAddingInvitation(true);
    try {
      const response = await fetch(`/api/events/${eventId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitedEmail: singleEmail.trim(),
          invitedName: singleName.trim() || undefined,
        }),
      });

      if (response.ok) {
        const newInvitation = await response.json();
        setInvitations(prev => [newInvitation, ...prev]);
        setSingleEmail('');
        setSingleName('');
        toast.success('Invitación creada exitosamente');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al crear la invitación');
      }
    } catch (error) {
      console.error('Error adding invitation:', error);
      toast.error('Error al crear la invitación');
    } finally {
      setIsAddingInvitation(false);
    }
  };

  const addBulkInvitations = async () => {
    if (!bulkEmails.trim()) {
      toast.error('Debes agregar al menos un email');
      return;
    }

    const emails = bulkEmails
      .split('\\n')
      .map(line => line.trim())
      .filter(line => line.includes('@'))
      .map(line => {
        const parts = line.split(',');
        return {
          email: parts[0].trim(),
          name: parts[1]?.trim() || undefined,
        };
      });

    if (emails.length === 0) {
      toast.error('No se encontraron emails válidos');
      return;
    }

    if (emails.length > 50) {
      toast.error('Máximo 50 invitaciones por lote');
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitations: emails }),
      });

      if (response.ok) {
        const result = await response.json();
        setInvitations(prev => [...result.created, ...prev]);
        setBulkEmails('');
        setIsBulkModalOpen(false);
        toast.success(`${result.created.length} invitaciones creadas exitosamente`);
        
        if (result.errors?.length > 0) {
          toast.warning(`${result.errors.length} invitaciones fallaron`);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al crear las invitaciones');
      }
    } catch (error) {
      console.error('Error adding bulk invitations:', error);
      toast.error('Error al crear las invitaciones');
    }
  };

  const handleInvitationAction = async (invitationId: string, action: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const updatedInvitation = await response.json();
        setInvitations(prev => 
          prev.map(inv => inv.id === invitationId ? updatedInvitation : inv)
        );
        
        const messages = {
          SEND: 'Invitación enviada exitosamente',
          RESEND: 'Invitación reenviada exitosamente',
          GENERATE_TICKET: 'Ticket generado exitosamente',
          CANCEL: 'Invitación cancelada',
        };
        
        toast.success(messages[action as keyof typeof messages] || 'Acción completada');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al procesar la acción');
      }
    } catch (error) {
      console.error('Error handling invitation action:', error);
      toast.error('Error al procesar la acción');
    }
  };

  const deleteInvitation = async (invitationId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta invitación?')) return;

    try {
      const response = await fetch(`/api/events/${eventId}/invitations/${invitationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        toast.success('Invitación eliminada exitosamente');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al eliminar la invitación');
      }
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast.error('Error al eliminar la invitación');
    }
  };

  const getStatusBadge = (invitation: CourtesyInvitation) => {
    switch (invitation.status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'SENT':
        return <Badge variant="default"><Mail className="w-3 h-3 mr-1" />Enviada</Badge>;
      case 'ACCEPTED':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Aceptada</Badge>;
      case 'EXPIRED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Expirada</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const exportInvitations = () => {
    const csvContent = [
      ['Email', 'Nombre', 'Estado', 'Enviado', 'Aceptado', 'QR Code', 'Usado'],
      ...invitations.map(inv => [
        inv.invitedEmail,
        inv.invitedName || '',
        inv.status,
        inv.sentAt ? formatFullDateTime(inv.sentAt) : '',
        inv.acceptedAt ? formatFullDateTime(inv.acceptedAt) : '',
        inv.ticket?.qrCode || '',
        inv.ticket?.isUsed ? 'Sí' : 'No',
      ])
    ].map(row => row.join(',')).join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invitaciones-${eventTitle.replace(/[^a-zA-Z0-9]/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invitaciones de Cortesía</h2>
          <p className="text-muted-foreground">
            Gestiona las invitaciones gratuitas para {eventTitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportInvitations}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Invitación Masiva
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Invitación Masiva</DialogTitle>
                <DialogDescription>
                  Agrega múltiples emails separados por líneas. Formato: email@ejemplo.com, Nombre (opcional)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulk-emails">Emails (máximo 50)</Label>
                  <Textarea
                    id="bulk-emails"
                    placeholder="usuario1@ejemplo.com, Juan Pérez&#10;usuario2@ejemplo.com&#10;usuario3@ejemplo.com, María García"
                    value={bulkEmails}
                    onChange={(e) => setBulkEmails(e.target.value)}
                    rows={10}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsBulkModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addBulkInvitations}>
                    Crear Invitaciones
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Add Single Invitation */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Agregar Invitación Individual</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={singleEmail}
              onChange={(e) => setSingleEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="name">Nombre (opcional)</Label>
            <Input
              id="name"
              placeholder="Nombre del invitado"
              value={singleName}
              onChange={(e) => setSingleName(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={addSingleInvitation}
              disabled={isAddingInvitation || !singleEmail.trim()}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isAddingInvitation ? 'Agregando...' : 'Agregar Invitación'}
            </Button>
          </div>
        </div>
      </div>

      {/* Invitations Table */}
      <div className="bg-card rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">
            Invitaciones ({invitations.length})
          </h3>
        </div>
        
        {invitations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay invitaciones creadas para este evento</p>
            <p className="text-sm">Agrega tu primera invitación arriba</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invitado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Creado por</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invitation.invitedName || 'Sin nombre'}</div>
                      <div className="text-sm text-muted-foreground">{invitation.invitedEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(invitation)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {invitation.sentAt && (
                        <div>Enviado: {formatFullDateTime(invitation.sentAt)}</div>
                      )}
                      {invitation.acceptedAt && (
                        <div>Aceptado: {formatFullDateTime(invitation.acceptedAt)}</div>
                      )}
                      {invitation.expiresAt && (
                        <div>Expira: {formatFullDateTime(invitation.expiresAt)}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {invitation.ticket ? (
                      <div className="text-sm">
                        <div className="font-mono text-xs">{invitation.ticket.qrCode}</div>
                        {invitation.ticket.isUsed && (
                          <Badge variant="secondary" className="mt-1">Usado</Badge>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline">Sin ticket</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {invitation.creator ? (
                        `${invitation.creator.firstName} ${invitation.creator.lastName || ''}`.trim()
                      ) : (
                        'Usuario no disponible'
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {invitation.status === 'PENDING' && (
                          <DropdownMenuItem
                            onClick={() => handleInvitationAction(invitation.id, 'SEND')}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Invitación
                          </DropdownMenuItem>
                        )}
                        {invitation.status === 'SENT' && (
                          <DropdownMenuItem
                            onClick={() => handleInvitationAction(invitation.id, 'RESEND')}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Reenviar
                          </DropdownMenuItem>
                        )}
                        {!invitation.ticket && (
                          <DropdownMenuItem
                            onClick={() => handleInvitationAction(invitation.id, 'GENERATE_TICKET')}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Generar Ticket
                          </DropdownMenuItem>
                        )}
                        {invitation.status !== 'EXPIRED' && (
                          <DropdownMenuItem
                            onClick={() => handleInvitationAction(invitation.id, 'CANCEL')}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => deleteInvitation(invitation.id)}
                          className="text-destructive"
                          disabled={invitation.ticket?.isUsed}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
