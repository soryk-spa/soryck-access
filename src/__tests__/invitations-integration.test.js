/**
 * Tests de integración para el sistema de invitaciones de cortesía
 * Simula el comportamiento completo del sistema
 */

// Mock del componente de notificaciones
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
};

// Función para simular el procesamiento de invitaciones masivas
function processInvitationText(textInput) {
  const lines = textInput.split('\n').filter(line => line.trim());
  const invitations = [];
  
  lines.forEach(line => {
    // Mejorar el regex para capturar solo el email sin puntuación
    const emailMatch = line.match(/([a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      const email = emailMatch[1];
      // Limpiar el nombre removiendo el email y puntuación
      let name = line.replace(emailMatch[0], '').replace(/[,;<>]/g, '').trim();
      // Remover angle brackets vacíos
      name = name.replace(/^\s*<\s*>\s*$/, '').trim();
      invitations.push({ 
        email, 
        name: name || undefined 
      });
    }
  });
  
  return invitations;
}

// Función para simular llamada a API
async function createInvitations(eventId, invitations) {
  // Simula validaciones del backend
  if (invitations.length > 50) {
    throw new Error('Máximo 50 invitaciones por lote');
  }
  
  const created = [];
  const errors = [];
  
  // Simula emails duplicados
  const existingEmails = ['duplicate@test.com', 'existing@test.com'];
  
  invitations.forEach((invitation, index) => {
    if (existingEmails.includes(invitation.email)) {
      errors.push(`Email ${invitation.email} ya existe`);
    } else {
      created.push({
        id: `inv-${index + 1}`,
        invitedEmail: invitation.email,
        invitedName: invitation.name,
        status: 'PENDING',
        invitationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
        createdAt: new Date().toISOString(),
      });
    }
  });
  
  return { created, errors };
}

describe('Sistema de Invitaciones - Integración', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToast.success.mockClear();
    mockToast.error.mockClear();
    mockToast.warning.mockClear();
  });

  describe('Procesamiento de texto a invitaciones', () => {
    it('debería procesar diferentes formatos de entrada', () => {
      const textInputs = [
        // Formato email, nombre
        'user1@test.com, Juan Pérez',
        // Solo email
        'user2@test.com',
        // Email con espacios
        '  user3@test.com  , María García  ',
        // Formato con punto y coma
        'user4@test.com; Carlos López',
        // Línea vacía (debería ignorarse)
        '',
        // Texto inválido (debería ignorarse)
        'esto no es un email',
        // Email en formato angle brackets
        'Ana Silva <user5@test.com>',
      ];

      const result = processInvitationText(textInputs.join('\n'));

      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({ email: 'user1@test.com', name: 'Juan Pérez' });
      expect(result[1]).toEqual({ email: 'user2@test.com', name: undefined });
      expect(result[2]).toEqual({ email: 'user3@test.com', name: 'María García' });
      expect(result[3]).toEqual({ email: 'user4@test.com', name: 'Carlos López' });
      expect(result[4]).toEqual({ email: 'user5@test.com', name: 'Ana Silva' });
    });

    it('debería manejar casos límite en el texto', () => {
      const edgeCases = [
        'email-con-guiones@test-domain.com',
        'email.con.puntos@test.domain.co.uk',
        'email+con+plus@test.com',
        'email_con_guiones_bajos@test.com',
        'usuario.123@dominio-con-numeros.com',
      ];

      const result = processInvitationText(edgeCases.join('\n'));

      expect(result).toHaveLength(5);
      result.forEach((invitation, index) => {
        expect(invitation.email).toBe(edgeCases[index]);
        expect(invitation.name).toBeUndefined();
      });
    });
  });

  describe('Validaciones de negocio', () => {
    it('debería validar límite de 50 invitaciones', async () => {
      const tooManyInvitations = Array.from({ length: 51 }, (_, i) => ({
        email: `user${i + 1}@test.com`,
        name: `User ${i + 1}`,
      }));

      await expect(createInvitations('event-1', tooManyInvitations))
        .rejects.toThrow('Máximo 50 invitaciones por lote');
    });

    it('debería procesar correctamente un lote válido', async () => {
      const validInvitations = [
        { email: 'user1@test.com', name: 'User 1' },
        { email: 'user2@test.com', name: 'User 2' },
        { email: 'user3@test.com', name: undefined },
      ];

      const result = await createInvitations('event-1', validInvitations);

      expect(result.created).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
      
      result.created.forEach((invitation, index) => {
        expect(invitation.invitedEmail).toBe(validInvitations[index].email);
        expect(invitation.invitedName).toBe(validInvitations[index].name);
        expect(invitation.status).toBe('PENDING');
        expect(invitation.invitationCode).toMatch(/^[A-Z0-9]{8}$/);
      });
    });

    it('debería manejar emails duplicados', async () => {
      const invitationsWithDuplicates = [
        { email: 'new@test.com', name: 'New User' },
        { email: 'duplicate@test.com', name: 'Duplicate User' },
        { email: 'another@test.com', name: 'Another User' },
        { email: 'existing@test.com', name: 'Existing User' },
      ];

      const result = await createInvitations('event-1', invitationsWithDuplicates);

      expect(result.created).toHaveLength(2);
      expect(result.errors).toHaveLength(2);
      
      expect(result.created[0].invitedEmail).toBe('new@test.com');
      expect(result.created[1].invitedEmail).toBe('another@test.com');
      
      expect(result.errors).toContain('Email duplicate@test.com ya existe');
      expect(result.errors).toContain('Email existing@test.com ya existe');
    });
  });

  describe('Flujo completo de invitaciones masivas', () => {
    it('debería procesar un flujo completo exitoso', async () => {
      const textInput = `
        juan.perez@empresa.com, Juan Pérez
        maria.garcia@empresa.com, María García
        carlos.lopez@empresa.com
        ana.silva@empresa.com, Ana Silva
      `;

      // Paso 1: Procesar texto
      const invitations = processInvitationText(textInput);
      expect(invitations).toHaveLength(4);

      // Paso 2: Crear invitaciones
      const result = await createInvitations('event-1', invitations);

      // Paso 3: Verificar resultados
      expect(result.created).toHaveLength(4);
      expect(result.errors).toHaveLength(0);

      // Simular notificación de éxito
      mockToast.success(`${result.created.length} invitaciones creadas exitosamente`);
      expect(mockToast.success).toHaveBeenCalledWith('4 invitaciones creadas exitosamente');
    });

    it('debería manejar un flujo con errores parciales', async () => {
      const textInput = `
        nuevo@empresa.com, Usuario Nuevo
        duplicate@test.com, Usuario Duplicado
        otro@empresa.com
        existing@test.com, Usuario Existente
        final@empresa.com, Usuario Final
      `;

      // Paso 1: Procesar texto
      const invitations = processInvitationText(textInput);
      expect(invitations).toHaveLength(5);

      // Paso 2: Crear invitaciones
      const result = await createInvitations('event-1', invitations);

      // Paso 3: Verificar resultados
      expect(result.created).toHaveLength(3);
      expect(result.errors).toHaveLength(2);

      // Simular notificaciones apropiadas
      if (result.created.length > 0) {
        mockToast.success(`${result.created.length} invitaciones creadas exitosamente`);
      }
      if (result.errors.length > 0) {
        mockToast.warning(`${result.errors.length} invitaciones fallaron`);
      }

      expect(mockToast.success).toHaveBeenCalledWith('3 invitaciones creadas exitosamente');
      expect(mockToast.warning).toHaveBeenCalledWith('2 invitaciones fallaron');
    });

    it('debería manejar entrada completamente inválida', async () => {
      const textInput = `
        esto no es un email
        tampoco esto
        ni esto tampoco
      `;

      // Paso 1: Procesar texto
      const invitations = processInvitationText(textInput);
      expect(invitations).toHaveLength(0);

      // Simular validación en frontend
      if (invitations.length === 0) {
        mockToast.error('No se encontraron emails válidos');
      }

      expect(mockToast.error).toHaveBeenCalledWith('No se encontraron emails válidos');
    });
  });

  describe('Formato de exportación CSV', () => {
    it('debería generar CSV correcto para exportar', () => {
      const invitations = [
        {
          id: 'inv-1',
          invitedEmail: 'user1@test.com',
          invitedName: 'User 1',
          status: 'PENDING',
          invitationCode: 'ABC123',
          expiresAt: '2025-12-31T23:59:59Z',
          createdAt: '2025-09-01T10:00:00Z',
        },
        {
          id: 'inv-2',
          invitedEmail: 'user2@test.com',
          invitedName: 'User 2',
          status: 'SENT',
          invitationCode: 'XYZ789',
          expiresAt: '2025-12-31T23:59:59Z',
          createdAt: '2025-09-01T11:00:00Z',
        },
      ];

      const csvHeaders = 'Email,Nombre,Estado,Código,Expira,Creada\n';
      const csvRows = invitations.map(inv => [
        inv.invitedEmail,
        inv.invitedName || '',
        inv.status,
        inv.invitationCode,
        new Date(inv.expiresAt).toLocaleDateString(),
        new Date(inv.createdAt).toLocaleDateString(),
      ].join(',')).join('\n');

      const csvContent = csvHeaders + csvRows;

      expect(csvContent).toContain('user1@test.com,User 1,PENDING,ABC123');
      expect(csvContent).toContain('user2@test.com,User 2,SENT,XYZ789');
      expect(csvContent.split('\n')).toHaveLength(3); // Header + 2 rows
    });
  });

  describe('Gestión de estados de invitación', () => {
    it('debería calcular estados correctamente', () => {
      const now = new Date();
      const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const invitations = [
        { status: 'PENDING', expiresAt: futureDate.toISOString() },
        { status: 'PENDING', expiresAt: pastDate.toISOString() },
        { status: 'SENT', expiresAt: futureDate.toISOString() },
        { status: 'ACCEPTED', expiresAt: futureDate.toISOString() },
      ];

      const processed = invitations.map(inv => ({
        ...inv,
        isExpired: new Date(inv.expiresAt) < now,
        effectiveStatus: new Date(inv.expiresAt) < now ? 'EXPIRED' : inv.status,
      }));

      expect(processed[0].effectiveStatus).toBe('PENDING');
      expect(processed[1].effectiveStatus).toBe('EXPIRED');
      expect(processed[2].effectiveStatus).toBe('SENT');
      expect(processed[3].effectiveStatus).toBe('ACCEPTED');
    });
  });
});
