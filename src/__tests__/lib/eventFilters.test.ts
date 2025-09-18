

import type { Event, EventFilters } from '@/types';


const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Concierto Rock Nacional',
    description: 'Un evento increíble de rock nacional',
    startDate: '2024-03-15T20:00:00Z',
    endDate: '2024-03-15T23:00:00Z',
    location: 'Teatro Municipal, Santiago',
    imageUrl: 'https://example.com/rock.jpg',
    capacity: 500,
    price: 25000,
    currency: 'CLP',
    isFree: false,
    isPublished: true,
    categoryId: 'music',
    organizerId: 'org1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    category: { id: 'music', name: 'Música' },
    organizer: {
      id: 'org1',
      email: 'organizer@example.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      role: 'ORGANIZER' as const,
    },
    ticketTypes: [
      {
        id: 'ticket1',
        name: 'General',
        price: 25000,
        capacity: 500,
        currency: 'CLP',
        eventId: '1',
        ticketsGenerated: 0,
      },
    ],
    _count: { tickets: 0 },
  },
  {
    id: '2',
    title: 'Workshop de Programación',
    description: 'Aprende React y Next.js desde cero',
    startDate: '2024-04-10T14:00:00Z',
    endDate: '2024-04-10T18:00:00Z',
    location: 'Centro de Innovación, Providencia',
    capacity: 50,
    price: 0,
    currency: 'CLP',
    isFree: true,
    isPublished: true,
    categoryId: 'education',
    organizerId: 'org2',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    category: { id: 'education', name: 'Educación' },
    organizer: {
      id: 'org2',
      email: 'educator@example.com',
      firstName: 'María',
      lastName: 'González',
      role: 'ORGANIZER' as const,
    },
    ticketTypes: [
      {
        id: 'ticket2',
        name: 'Entrada Gratuita',
        price: 0,
        capacity: 50,
        currency: 'CLP',
        eventId: '2',
        ticketsGenerated: 25,
      },
    ],
    _count: { tickets: 25 },
  },
  {
    id: '3',
    title: 'Festival Gastronómico',
    description: 'Los mejores chefs de Chile en un solo lugar',
    startDate: '2024-05-20T12:00:00Z',
    endDate: '2024-05-20T22:00:00Z',
    location: 'Parque Bicentenario, Las Condes',
    capacity: 1000,
    price: 15000,
    currency: 'CLP',
    isFree: false,
    isPublished: false, 
    categoryId: 'food',
    organizerId: 'org3',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    category: { id: 'food', name: 'Gastronomía' },
    organizer: {
      id: 'org3',
      email: 'chef@example.com',
      firstName: 'Carlos',
      lastName: 'Mendoza',
      role: 'ORGANIZER' as const,
    },
    ticketTypes: [
      {
        id: 'ticket3',
        name: 'Acceso Completo',
        price: 15000,
        capacity: 1000,
        currency: 'CLP',
        eventId: '3',
        ticketsGenerated: 150,
      },
    ],
    _count: { tickets: 150 },
  },
];


function filterEvents(events: Event[], filters: EventFilters): Event[] {
  return events.filter(event => {
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = event.title.toLowerCase().includes(searchLower);
      const matchesDescription = event.description.toLowerCase().includes(searchLower);
      if (!matchesTitle && !matchesDescription) return false;
    }

    
    if (filters.categoryId && event.categoryId !== filters.categoryId) {
      return false;
    }

    
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      if (event.price < minPrice) return false;
    }

    
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      if (event.price > maxPrice) return false;
    }

    
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      const eventDate = new Date(event.startDate);
      if (eventDate < fromDate) return false;
    }

    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      const eventDate = new Date(event.startDate);
      if (eventDate > toDate) return false;
    }

    
    if (filters.status === 'published' && !event.isPublished) return false;
    if (filters.status === 'draft' && event.isPublished) return false;

    
    if (filters.isFree !== undefined) {
      if (filters.isFree && !event.isFree) return false;
      if (!filters.isFree && event.isFree) return false;
    }

    return true;
  });
}


function calculateEventStats(events: Event[]) {
  const published = events.filter(e => e.isPublished);
  const draft = events.filter(e => !e.isPublished);
  const free = events.filter(e => e.isFree);
  const paid = events.filter(e => !e.isFree);

  const totalRevenue = events.reduce((sum, event) => {
    return sum + (event.price * event._count.tickets);
  }, 0);

  const averagePrice = events.length > 0 
    ? events.reduce((sum, event) => sum + event.price, 0) / events.length 
    : 0;

  const totalTicketsSold = events.reduce((sum, event) => sum + event._count.tickets, 0);

  return {
    total: events.length,
    published: published.length,
    draft: draft.length,
    free: free.length,
    paid: paid.length,
    totalRevenue,
    averagePrice,
    totalTicketsSold,
    averageOccupancy: events.length > 0 
      ? events.reduce((sum, event) => {
          const occupancy = event.capacity > 0 ? (event._count.tickets / event.capacity) * 100 : 0;
          return sum + occupancy;
        }, 0) / events.length 
      : 0,
  };
}

describe('Funcionalidades de Filtrado de Eventos', () => {
  describe('Filtro por búsqueda de texto', () => {
    it('filtra por título del evento', () => {
      const filters: EventFilters = { search: 'rock' };
      const result = filterEvents(mockEvents, filters);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Concierto Rock Nacional');
    });

    it('filtra por descripción del evento', () => {
      const filters: EventFilters = { search: 'react' };
      const result = filterEvents(mockEvents, filters);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Workshop de Programación');
    });

    it('busca de forma case-insensitive', () => {
      const filters: EventFilters = { search: 'ROCK' };
      const result = filterEvents(mockEvents, filters);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Concierto Rock Nacional');
    });

    it('devuelve array vacío si no encuentra coincidencias', () => {
      const filters: EventFilters = { search: 'inexistente' };
      const result = filterEvents(mockEvents, filters);

      expect(result).toHaveLength(0);
    });
  });

  describe('Filtro por categoría', () => {
    it('filtra eventos por categoría específica', () => {
      const filters: EventFilters = { categoryId: 'music' };
      const result = filterEvents(mockEvents, filters);

      expect(result).toHaveLength(1);
      expect(result[0].category.name).toBe('Música');
    });

    it('devuelve todos los eventos si no se especifica categoría', () => {
      const filters: EventFilters = {};
      const result = filterEvents(mockEvents, filters);

      expect(result).toHaveLength(3);
    });
  });

  describe('Filtro por rango de precios', () => {
    it('filtra por precio mínimo', () => {
      const filters: EventFilters = { minPrice: '20000' };
      const result = filterEvents(mockEvents, filters);

      expect(result).toHaveLength(1);
      expect(result[0].price).toBeGreaterThanOrEqual(20000);
    });

    it('filtra por precio máximo', () => {
      const filters: EventFilters = { maxPrice: '20000' };
      const result = filterEvents(mockEvents, filters);

      expect(result).toHaveLength(2); 
      expect(result.every(event => event.price <= 20000)).toBe(true);
    });

    it('combina precio mínimo y máximo', () => {
      const filters: EventFilters = { 
        minPrice: '10000', 
        maxPrice: '20000' 
      };
      const result = filterEvents(mockEvents, filters);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Festival Gastronómico');
    });
  });

  describe('Filtro por fechas', () => {
    it('filtra eventos desde una fecha específica', () => {
      const filters: EventFilters = { dateFrom: '2024-04-01' };
      const result = filterEvents(mockEvents, filters);

      expect(result).toHaveLength(2); 
      expect(result.every(event => new Date(event.startDate) >= new Date('2024-04-01'))).toBe(true);
    });

    it('filtra eventos hasta una fecha específica', () => {
      const filters: EventFilters = { dateTo: '2024-04-01' };
      const result = filterEvents(mockEvents, filters);

      expect(result).toHaveLength(1); 
      expect(result[0].title).toBe('Concierto Rock Nacional');
    });
  });

  describe('Filtro por estado de publicación', () => {
    it('filtra solo eventos publicados', () => {
      const filters: EventFilters = { status: 'published' };
      const result = filterEvents(mockEvents, filters);

      expect(result).toHaveLength(2);
      expect(result.every(event => event.isPublished)).toBe(true);
    });

    it('filtra solo borradores', () => {
      const filters: EventFilters = { status: 'draft' };
      const result = filterEvents(mockEvents, filters);

      expect(result).toHaveLength(1);
      expect(result[0].isPublished).toBe(false);
    });
  });

  describe('Filtro por eventos gratuitos', () => {
    it('filtra solo eventos gratuitos', () => {
      const filters: EventFilters = { isFree: true };
      const result = filterEvents(mockEvents, filters);

      expect(result).toHaveLength(1);
      expect(result[0].isFree).toBe(true);
      expect(result[0].title).toBe('Workshop de Programación');
    });

    it('filtra solo eventos pagados', () => {
      const filters: EventFilters = { isFree: false };
      const result = filterEvents(mockEvents, filters);

      expect(result).toHaveLength(2);
      expect(result.every(event => !event.isFree)).toBe(true);
    });
  });

  describe('Combinación de filtros', () => {
    it('aplica múltiples filtros simultáneamente', () => {
      const filters: EventFilters = {
        search: 'nacional',
        categoryId: 'music',
        status: 'published',
        isFree: false,
      };
      const result = filterEvents(mockEvents, filters);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Concierto Rock Nacional');
    });

    it('devuelve array vacío si ningún evento cumple todos los filtros', () => {
      const filters: EventFilters = {
        categoryId: 'music',
        isFree: true, 
      };
      const result = filterEvents(mockEvents, filters);

      expect(result).toHaveLength(0);
    });
  });
});

describe('Cálculo de Estadísticas de Eventos', () => {
  it('calcula estadísticas básicas correctamente', () => {
    const stats = calculateEventStats(mockEvents);

    expect(stats.total).toBe(3);
    expect(stats.published).toBe(2);
    expect(stats.draft).toBe(1);
    expect(stats.free).toBe(1);
    expect(stats.paid).toBe(2);
  });

  it('calcula ingresos totales correctamente', () => {
    const stats = calculateEventStats(mockEvents);

    
    
    
    expect(stats.totalRevenue).toBe(2250000);
  });

  it('calcula precio promedio correctamente', () => {
    const stats = calculateEventStats(mockEvents);

    
    expect(stats.averagePrice).toBeCloseTo(13333.33, 2);
  });

  it('calcula tickets vendidos totales', () => {
    const stats = calculateEventStats(mockEvents);

    expect(stats.totalTicketsSold).toBe(175); 
  });

  it('calcula ocupación promedio', () => {
    const stats = calculateEventStats(mockEvents);

    
    
    
    
    expect(stats.averageOccupancy).toBeCloseTo(21.67, 2);
  });

  it('maneja array vacío correctamente', () => {
    const stats = calculateEventStats([]);

    expect(stats.total).toBe(0);
    expect(stats.totalRevenue).toBe(0);
    expect(stats.averagePrice).toBe(0);
    expect(stats.averageOccupancy).toBe(0);
  });
});
