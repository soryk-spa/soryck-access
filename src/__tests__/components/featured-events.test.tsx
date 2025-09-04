import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import FeaturedEvents from '../../components/featured-events'

describe('FeaturedEvents component', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('renders loading state then events', async () => {
    const mockEvents = [{ id: 'e1', title: 'Evento 1' }]
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ events: mockEvents }) }) as unknown as jest.Mock

    render(<FeaturedEvents />)

    // loading
    expect(screen.getByText(/Cargando eventos destacados/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Próximos Eventos/i)).toBeInTheDocument()
    })
  })
})
