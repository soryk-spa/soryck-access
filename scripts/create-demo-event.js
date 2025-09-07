// Demo event creation script
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createDemoEvent() {
  try {
    console.log('🎭 Creando evento demo con sistema de asientos...')

    // Buscar un organizador existente
    const organizer = await prisma.user.findFirst({
      where: { 
        OR: [
          { role: 'ORGANIZER' },
          { role: 'ADMIN' }
        ]
      }
    })

    if (!organizer) {
      console.error('❌ No se encontró un organizador. Crea un usuario primero.')
      return
    }

    // Buscar una categoría existente
    let category = await prisma.category.findFirst()
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: 'Música',
          description: 'Eventos musicales'
        }
      })
    }

    // Crear evento
    const event = await prisma.event.create({
      data: {
        title: '🎵 Concierto Demo con Asientos',
        description: 'Evento de demostración para probar el sistema de asientos con múltiples secciones.',
        startDate: new Date('2024-12-15T20:00:00'),
        endDate: new Date('2024-12-15T23:00:00'),
        location: 'Teatro Municipal Demo',
        organizerId: organizer.id,
        categoryId: category.id,
        isPublished: true,
        capacity: 500,
        hasSeatingPlan: true,
        price: 0
      }
    })

    console.log(`✅ Evento creado: ${event.title} (ID: ${event.id})`)

    // Crear secciones con diferentes configuraciones
    const sectionsData = [
      {
        name: 'VIP',
        price: 50000,
        hasSeats: true,
        rowCount: 5,
        seatsPerRow: 8,
        seatCount: 40
      },
      {
        name: 'Platea',
        price: 35000,
        hasSeats: true,
        rowCount: 10,
        seatsPerRow: 12,
        seatCount: 120
      },
      {
        name: 'Balcón',
        price: 25000,
        hasSeats: true,
        rowCount: 8,
        seatsPerRow: 10,
        seatCount: 80
      },
      {
        name: 'General',
        price: 15000,
        hasSeats: false,
        seatCount: 100
      }
    ]

    let totalSeats = 0

    for (const sectionData of sectionsData) {
      console.log(`📍 Creando sección: ${sectionData.name}`)
      
      const section = await prisma.section.create({
        data: {
          eventId: event.id,
          name: sectionData.name,
          basePrice: sectionData.price,
          hasSeats: sectionData.hasSeats,
          seatCount: sectionData.seatCount,
          rowCount: sectionData.rowCount || 0,
          seatsPerRow: sectionData.seatsPerRow || 0
        }
      })

      if (sectionData.hasSeats && sectionData.rowCount && sectionData.seatsPerRow) {
        // Generar asientos manualmente
        const seats = []
        for (let rowIndex = 0; rowIndex < sectionData.rowCount; rowIndex++) {
          const rowLetter = String.fromCharCode(65 + rowIndex) // A, B, C, etc.
          
          for (let seatIndex = 1; seatIndex <= sectionData.seatsPerRow; seatIndex++) {
            seats.push({
              id: `${section.id}-${rowLetter}-${seatIndex}`,
              sectionId: section.id,
              row: rowLetter,
              number: seatIndex.toString(),
              status: 'AVAILABLE'
            })
          }
        }

        await prisma.eventSeat.createMany({
          data: seats,
          skipDuplicates: true
        })

        console.log(`  💺 ${sectionData.seatCount} asientos generados`)
        totalSeats += sectionData.seatCount
      } else {
        console.log(`  🎫 Sección general sin asientos específicos`)
      }

      // Crear ticket type para cada sección
      await prisma.ticketType.create({
        data: {
          eventId: event.id,
          name: sectionData.name,
          price: sectionData.price,
          currency: 'CLP',
          capacity: sectionData.hasSeats ? sectionData.seatCount : 100
        }
      })
    }

    console.log(`\\n🎉 Evento demo creado exitosamente!`)
    console.log(`📊 Total de asientos: ${totalSeats}`)
    console.log(`🌐 URL: http://localhost:3000/events/${event.id}`)

    return event

  } catch (error) {
    console.error('❌ Error creando evento demo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script
createDemoEvent()
