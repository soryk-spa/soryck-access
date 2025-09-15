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
import { getCurrentPrice, type TicketTypeWithPricing } from '@/lib/pricing';
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
  Edit,
} from 'lucide-react';
import { formatFullDateTime } from '@/lib/date-utils';

interface CourtesyInvitation {
  id: string;
  invitedEmail: string;
  invitedName?: string;
  status: 'PENDING' | 'SENT' | 'ACCEPTED' | 'EXPIRED' | 'SUPERSEDED';
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
  
  // Estados para edición
  const [editingInvitation, setEditingInvitation] = useState<CourtesyInvitation | null>(null);
  const [editForm, setEditForm] = useState({
    invitedName: '',
    message: '',
    ticketTypeId: '',
    priceTierId: '',
  });

  
  const [singleEmail, setSingleEmail] = useState('');
  const [singleName, setSingleName] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  // helper to centralize logging (silence in test env)
  const logError = (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'test') return;
    const logFn = globalThis.console?.error;
    if (logFn) logFn(...args);
  };
  type PriceTierOption = { id: string; name: string; price?: number; startDate?: string; endDate?: string; isActive?: boolean };
  type TicketTypeOption = { 
    id: string; 
    name: string; 
    price?: number; 
    currency?: string;
    priceTiers?: PriceTierOption[] 
  };

  // Helper function to get current price info
  const getPriceInfo = (ticketType: TicketTypeOption) => {
    if (!ticketType.price || !ticketType.currency) {
      return { price: 0, currency: 'CLP', tierName: undefined };
    }
    
    // Convert to TicketTypeWithPricing format for pricing utility
    const pricingTicketType: TicketTypeWithPricing = {
      id: ticketType.id,
      name: ticketType.name,
      price: ticketType.price,
      currency: ticketType.currency,
      priceTiers: ticketType.priceTiers?.map(pt => ({
        id: pt.id,
        name: pt.name,
        price: pt.price || 0,
        currency: ticketType.currency || 'CLP',
        startDate: pt.startDate ? new Date(pt.startDate) : new Date(),
        endDate: pt.endDate ? new Date(pt.endDate) : null,
        isActive: pt.isActive !== false
      }))
    };
    
    const currentPrice = getCurrentPrice(pricingTicketType);
    return {
      ...currentPrice,
      currency: ticketType.currency
    };
  };

  // Helper function to format price display
  const formatPrice = (price: number, currency: string = 'CLP') => {
    return new Intl.NumberFormat('es-CL', { 
      style: 'currency', 
      currency 
    }).format(price);
  };

  // Types for fetched API payloads

  const [ticketTypes, setTicketTypes] = useState<TicketTypeOption[]>([]);
  const [selectedSingleTicketTypeId, setSelectedSingleTicketTypeId] = useState<string | undefined>(undefined);
  const [selectedBulkTicketTypeId, setSelectedBulkTicketTypeId] = useState<string | undefined>(undefined);
  const [selectedSinglePriceTierId, setSelectedSinglePriceTierId] = useState<string | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedBulkPriceTierId, _setSelectedBulkPriceTierId] = useState<string | undefined>(undefined);

  const fetchInvitations = useCallback(async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/invitations`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.invitations && Array.isArray(data.invitations)) {
          setInvitations(data.invitations);
        } else {
          logError('La respuesta de la API no contiene invitaciones como array:', data);
          setInvitations([]);
          toast.error('Error en el formato de datos de invitaciones');
        }
        } else {
          // Try to parse JSON error, but be resilient to non-JSON responses
          let errorMessage = 'Error al cargar invitaciones';
          try {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const errorData = await response.json();
              logError('Error response (json):', errorData);
              if (typeof errorData?.error === 'string') errorMessage = errorData.error;
              else if (typeof errorData?.message === 'string') errorMessage = errorData.message;
            } else {
              const text = await response.text();
              logError('Error response (text):', text);
              if (text) errorMessage = text;
            }
          } catch (parseError) {
            logError('Error parsing error response body:', parseError);
          }

          // Surface a user-friendly toast and return (the outer catch also handles unexpected errors)
          toast.error(errorMessage);
          setInvitations([]);
          setLoading(false);
          return;
        }
    } catch (error) {
      logError('Error fetching invitations:', error);
      toast.error('Error al cargar las invitaciones');
      setInvitations([]); 
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchInvitations();
    // Fetch event to get ticket types for selection
    (async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          const tts = (data.event?.ticketTypes || []) as unknown[];
          const mapped = tts.map((t) => {
            const tt = t as { id: string; name: string; price?: number; currency?: string; priceTiers?: unknown[] };
            const priceTiers = (tt.priceTiers || []).map((pt) => {
              const p = pt as { id: string; name: string; price?: number; startDate?: string; endDate?: string; isActive?: boolean; currency?: string };
              return { id: p.id, name: p.name, price: p.price, startDate: p.startDate, endDate: p.endDate, isActive: p.isActive, currency: p.currency };
            });
            // prefer ticket-type currency, fall back to event.currency, then CLP
            const currency = tt.currency || data.event?.currency || 'CLP';
            return { id: tt.id, name: tt.name, price: tt.price, currency, priceTiers };
          });
          setTicketTypes(mapped);
          if (mapped.length > 0) setSelectedSingleTicketTypeId(mapped[0].id);
        } else {
          logError('Error fetching event ticket types');
        }
      } catch (err) {
        logError('Error fetching event details:', err);
      }
    })();
  }, [fetchInvitations, eventId]);

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
          ticketTypeId: selectedSingleTicketTypeId || undefined,
          priceTierId: selectedSinglePriceTierId || undefined,
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
        body: JSON.stringify({ invitations: emails.map(e => ({ ...e, ticketTypeId: selectedBulkTicketTypeId || undefined, priceTierId: selectedBulkPriceTierId || undefined })) }),
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
      logError('Error adding bulk invitations:', error);
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

  // Handlers para edición
  const openEditDialog = (invitation: CourtesyInvitation) => {
    setEditingInvitation(invitation);
    setEditForm({
      invitedName: invitation.invitedName || '',
      message: '',
      ticketTypeId: '',
      priceTierId: '',
    });
  };

  const handleEditSubmit = async () => {
    if (!editingInvitation) return;

    try {
      const response = await fetch(`/api/events/${eventId}/invitations/${editingInvitation.id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitedName: editForm.invitedName,
          message: editForm.message || undefined,
          ticketTypeId: editForm.ticketTypeId || undefined,
          priceTierId: editForm.priceTierId || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Actualizar la lista: marcar la original como supersedida y añadir la nueva
        setInvitations(prev => 
          prev.map(inv => 
            inv.id === editingInvitation.id 
              ? { ...inv, status: 'SUPERSEDED' as const }
              : inv
          ).concat([result.newInvitation])
        );
        
        setEditingInvitation(null);
        toast.success('Invitación editada exitosamente. Se ha creado una nueva invitación.');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al editar la invitación');
      }
    } catch (error) {
      console.error('Error editing invitation:', error);
      toast.error('Error al editar la invitación');
    }
  };

  const cancelEdit = () => {
    setEditingInvitation(null);
    setEditForm({
      invitedName: '',
      message: '',
      ticketTypeId: '',
      priceTierId: '',
    });
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
      case 'SUPERSEDED':
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Reemplazada</Badge>;
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
      {}
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
                <div>
                  <Label htmlFor="bulk-ticket-type">Tipo de entrada por defecto para el lote (opcional)</Label>
                  <select
                    id="bulk-ticket-type"
                    value={selectedBulkTicketTypeId ?? ''}
                    onChange={(e) => setSelectedBulkTicketTypeId(e.target.value || undefined)}
                    className="w-full rounded-md border px-3 py-2"
                  >
                    <option value="">Sin selección</option>
                    {ticketTypes.map(tt => {
                      const priceInfo = getPriceInfo(tt);
                      const currentPriceDisplay = formatPrice(priceInfo.price, priceInfo.currency);
                      const tierInfo = priceInfo.tierName ? ` (${priceInfo.tierName})` : '';
                      const isEarlyBird = priceInfo.isEarlyBird ? ' 🎉' : '';
                      
                      return (
                        <option key={tt.id} value={tt.id}>
                          {tt.name} — {currentPriceDisplay}{tierInfo}{isEarlyBird}
                        </option>
                      );
                    })}
                  </select>
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

      {}
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
            <div>
              <Label htmlFor="single-ticket-type">Tipo de entrada (opcional)</Label>
              <select
                id="single-ticket-type"
                value={selectedSingleTicketTypeId ?? ''}
                onChange={(e) => {
                  const val = e.target.value || undefined;
                  setSelectedSingleTicketTypeId(val);
                  // Reset price tier selection when ticket type changes
                  setSelectedSinglePriceTierId(undefined);
                }}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="">Seleccionar (opcional)</option>
                {ticketTypes.map(tt => {
                  const priceInfo = getPriceInfo(tt);
                  const currentPriceDisplay = formatPrice(priceInfo.price, priceInfo.currency);
                  const tierInfo = priceInfo.tierName ? ` (${priceInfo.tierName})` : '';
                  const isEarlyBird = priceInfo.isEarlyBird ? ' 🎉' : '';
                  
                  return (
                    <option key={tt.id} value={tt.id}>
                      {tt.name} — {currentPriceDisplay}{tierInfo}{isEarlyBird}
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Los precios mostrados reflejan el precio dinámico actual. 🎉 = Precio promocional
              </p>

              {/* Price tier selector (shows when selected ticket type has tiers) */}
              {selectedSingleTicketTypeId && (
                (() => {
                  const tt = ticketTypes.find(t => t.id === selectedSingleTicketTypeId);
                  if (!tt) return null;
                  if (!tt.priceTiers || tt.priceTiers.length === 0) return null;
                  
                  const basePriceDisplay = formatPrice(tt.price || 0, tt.currency);
                  
                  return (
                    <div className="mt-2">
                      <Label htmlFor="single-price-tier">Precio dinámico (opcional)</Label>
                      <select
                        id="single-price-tier"
                        value={selectedSinglePriceTierId ?? ''}
                        onChange={(e) => setSelectedSinglePriceTierId(e.target.value || undefined)}
                        className="w-full rounded-md border px-3 py-2"
                      >
                        <option value="">Precio base — {basePriceDisplay}</option>
                        {tt.priceTiers.map(pt => {
                          const tierPriceDisplay = formatPrice(pt.price || 0, tt.currency);
                          return (
                            <option key={pt.id} value={pt.id}>
                              {pt.name} — {tierPriceDisplay}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  );
                })()
              )}
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

      {}
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
                        {(['SENT', 'ACCEPTED'].includes(invitation.status)) && (
                          <DropdownMenuItem
                            onClick={() => openEditDialog(invitation)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
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

      {/* Diálogo de Edición */}
      {editingInvitation && (
        <Dialog open={!!editingInvitation} onOpenChange={(open) => !open && cancelEdit()}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Invitación de Cortesía</DialogTitle>
              <DialogDescription>
                Editar la invitación para {editingInvitation.invitedEmail}. Se creará una nueva invitación y la anterior será marcada como reemplazada.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nombre del Invitado</Label>
                <Input
                  id="edit-name"
                  value={editForm.invitedName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, invitedName: e.target.value }))}
                  placeholder="Nombre opcional"
                />
              </div>

              <div>
                <Label htmlFor="edit-message">Mensaje Personal (Opcional)</Label>
                <Textarea
                  id="edit-message"
                  value={editForm.message}
                  onChange={(e) => setEditForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Mensaje personal para el invitado"
                  className="min-h-[80px]"
                />
              </div>

              {ticketTypes.length > 0 && (
                <div>
                  <Label htmlFor="edit-ticket-type">Tipo de Ticket (Opcional)</Label>
                  <select
                    id="edit-ticket-type"
                    value={editForm.ticketTypeId}
                    onChange={(e) => {
                      setEditForm(prev => ({ 
                        ...prev, 
                        ticketTypeId: e.target.value,
                        priceTierId: '' // Reset price tier when ticket type changes
                      }));
                    }}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Seleccionar tipo de ticket...</option>
                    {ticketTypes.map((ticketType) => {
                      const priceInfo = getPriceInfo(ticketType);
                      return (
                        <option key={ticketType.id} value={ticketType.id}>
                          {ticketType.name} - {formatPrice(priceInfo.price, priceInfo.currency)}
                          {priceInfo.tierName && ` (${priceInfo.tierName})`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {editForm.ticketTypeId && (
                <div>
                  <Label htmlFor="edit-price-tier">Nivel de Precio (Opcional)</Label>
                  <select
                    id="edit-price-tier"
                    value={editForm.priceTierId}
                    onChange={(e) => setEditForm(prev => ({ ...prev, priceTierId: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Usar precio general</option>
                    {ticketTypes
                      .find(tt => tt.id === editForm.ticketTypeId)
                      ?.priceTiers
                      ?.filter(pt => pt.isActive !== false)
                      ?.map((priceTier) => (
                        <option key={priceTier.id} value={priceTier.id}>
                          {priceTier.name} - {formatPrice(priceTier.price || 0, 'CLP')}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={cancelEdit}>
                Cancelar
              </Button>
              <Button onClick={handleEditSubmit}>
                Actualizar Invitación
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
