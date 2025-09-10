/**
 * Tests para el componente CourtesyInvitationsManagement
 * @file components/courtesy-invitations-management.tsx
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import CourtesyInvitationsManagement from '../../components/courtesy-invitations-management';

// Mock de Sonner Toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock de fetch global
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock de window.URL.createObjectURL para exportar
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn(),
  },
});

// Mock de createElement para link de descarga
const mockCreateElement = jest.fn();
const mockClick = jest.fn();
const mockRemove = jest.fn();

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement.mockReturnValue({
    href: '',
    download: '',
    style: { display: '' },
    click: mockClick,
    remove: mockRemove,
  }),
});

Object.defineProperty(document.body, 'appendChild', {
  value: jest.fn(),
});

describe('CourtesyInvitationsManagement', () => {
  const mockProps = {
    eventId: 'event-123',
    eventTitle: 'Test Event',
  };

  const mockInvitations = [
    {
      id: 'inv-1',
      invitedEmail: 'test1@example.com',
      invitedName: 'Test User 1',
      status: 'PENDING' as const,
      invitationCode: 'code123',
      expiresAt: '2025-12-31T23:59:59Z',
      createdAt: '2025-09-01T10:00:00Z',
      ticket: null,
      creator: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
      },
    },
    {
      id: 'inv-2',
      invitedEmail: 'test2@example.com',
      invitedName: 'Test User 2',
      status: 'SENT' as const,
      invitationCode: 'code456',
      expiresAt: '2025-12-31T23:59:59Z',
      createdAt: '2025-09-01T11:00:00Z',
      ticket: {
        id: 'ticket-1',
        qrCode: 'QR123',
        isUsed: false,
        usedAt: null,
      },
      creator: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Renderizado inicial', () => {
    it('debería renderizar el título y elementos principales', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          event: { id: 'event-123', title: 'Test Event' },
          invitations: [],
        }),
      });

      render(<CourtesyInvitationsManagement {...mockProps} />);

      expect(screen.getByText('Invitaciones de Cortesía')).toBeInTheDocument();
      expect(screen.getByText('Agregar Invitación Individual')).toBeInTheDocument();
      expect(screen.getByText('Invitación Masiva')).toBeInTheDocument();

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(`/api/events/${mockProps.eventId}/invitations`);
      });
    });

    it('debería mostrar la tabla de invitaciones cuando hay datos', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          event: { id: 'event-123', title: 'Test Event' },
          invitations: mockInvitations,
        }),
      });

      render(<CourtesyInvitationsManagement {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('test1@example.com')).toBeInTheDocument();
        expect(screen.getByText('Test User 1')).toBeInTheDocument();
        expect(screen.getByText('test2@example.com')).toBeInTheDocument();
        expect(screen.getByText('Test User 2')).toBeInTheDocument();
      });

      expect(screen.getByText('PENDING')).toBeInTheDocument();
      expect(screen.getByText('SENT')).toBeInTheDocument();
    });

    it('debería manejar errores al cargar invitaciones', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<CourtesyInvitationsManagement {...mockProps} />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error al cargar las invitaciones');
      });
    });
  });

  describe('Invitación individual', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          event: { id: 'event-123', title: 'Test Event' },
          invitations: [],
        }),
      });
    });

    it('debería agregar una invitación individual exitosamente', async () => {
      // Mock respuesta exitosa para crear invitación
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: '1 invitación(es) creada(s) exitosamente',
          invitations: [mockInvitations[0]],
        }),
      });

      render(<CourtesyInvitationsManagement {...mockProps} />);

      // Esperar a que cargue
      await waitFor(() => {
        expect(screen.getByLabelText('Email *')).toBeInTheDocument();
      });

      // Llenar formulario
      const emailInput = screen.getByLabelText('Email *');
      const nameInput = screen.getByLabelText('Nombre (opcional)');
      
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.change(nameInput, { target: { value: 'New User' } });

      // Enviar
      fireEvent.click(screen.getByRole('button', { name: 'Agregar Invitación' }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenLastCalledWith(
          `/api/events/${mockProps.eventId}/invitations`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              invitedEmail: 'new@example.com',
              invitedName: 'New User',
            }),
          }
        );
        expect(toast.success).toHaveBeenCalledWith('Invitación creada exitosamente');
      });
    });

    it('debería validar email requerido', async () => {
      render(<CourtesyInvitationsManagement {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Email *')).toBeInTheDocument();
      });

      // Intentar enviar sin email
      fireEvent.click(screen.getByRole('button', { name: 'Agregar Invitación' }));

      expect(toast.error).toHaveBeenCalledWith('El email es requerido');
      expect(mockFetch).toHaveBeenCalledTimes(1); // Solo la carga inicial
    });

    it('debería manejar errores al crear invitación individual', async () => {
      // Mock error en creación
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email ya existe' }),
      });

      render(<CourtesyInvitationsManagement {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Email *')).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText('Email *');
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: 'Agregar Invitación' }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Email ya existe');
      });
    });
  });

  describe('Invitaciones masivas', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          event: { id: 'event-123', title: 'Test Event' },
          invitations: [],
        }),
      });
    });

    it('debería abrir el modal de invitaciones masivas', async () => {
      render(<CourtesyInvitationsManagement {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Invitación Masiva')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Invitación Masiva/i }));

      expect(screen.getByText('Agrega múltiples emails separados por líneas')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/usuario1@ejemplo.com/)).toBeInTheDocument();
    });

    it('debería validar que se agregue al menos un email', async () => {
      render(<CourtesyInvitationsManagement {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Invitación Masiva')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Invitación Masiva/i }));
      fireEvent.click(screen.getByRole('button', { name: 'Crear Invitaciones' }));

      expect(toast.error).toHaveBeenCalledWith('Debes agregar al menos un email');
    });

    it('debería procesar invitaciones masivas exitosamente', async () => {
      // Mock respuesta exitosa para invitaciones masivas
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          created: [mockInvitations[0], mockInvitations[1]],
          errors: [],
        }),
      });

      render(<CourtesyInvitationsManagement {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Invitación Masiva')).toBeInTheDocument();
      });

      // Abrir modal
      fireEvent.click(screen.getByRole('button', { name: /Invitación Masiva/i }));

      // Llenar textarea con múltiples emails
      const textarea = screen.getByPlaceholderText(/usuario1@ejemplo.com/);
      fireEvent.change(textarea, { 
        target: { value: 'user1@test.com, User One\nuser2@test.com, User Two\nuser3@test.com' }
      });

      // Enviar
      fireEvent.click(screen.getByRole('button', { name: 'Crear Invitaciones' }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenLastCalledWith(
          `/api/events/${mockProps.eventId}/invitations`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              invitations: [
                { email: 'user1@test.com', name: 'User One' },
                { email: 'user2@test.com', name: 'User Two' },
                { email: 'user3@test.com', name: undefined },
              ],
            }),
          }
        );
        expect(toast.success).toHaveBeenCalledWith('2 invitaciones creadas exitosamente');
      });
    });
  });

  describe('Exportar invitaciones', () => {
    it('debería exportar invitaciones a CSV', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          event: { id: 'event-123', title: 'Test Event' },
          invitations: mockInvitations,
        }),
      });

      render(<CourtesyInvitationsManagement {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('test1@example.com')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Exportar/i }));

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemove).toHaveBeenCalled();
    });

    it('debería mostrar mensaje cuando no hay invitaciones para exportar', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          event: { id: 'event-123', title: 'Test Event' },
          invitations: [],
        }),
      });

      render(<CourtesyInvitationsManagement {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Exportar/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Exportar/i }));

      expect(toast.error).toHaveBeenCalledWith('No hay invitaciones para exportar');
    });
  });
});
