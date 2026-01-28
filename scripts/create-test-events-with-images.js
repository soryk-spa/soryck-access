// Script para crear eventos de prueba con imágenes
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const testEvents = [
  {
    title: '🎵 Festival de Rock en Vivo',
    description: 'El mejor festival de rock del año con bandas nacionales e internacionales. Una noche inolvidable de música y energía.',
    imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1920&h=600&fit=crop',
    category: 'Música',
    location: 'Estadio Nacional',
    price: 45000,
    capacity: 5000,
    date: new Date('2026-03-15T20:00:00')
  },
  {
    title: '🎭 Obra de Teatro: Romeo y Julieta',
    description: 'Adaptación moderna del clásico de Shakespeare. Una producción impresionante que no te puedes perder.',
    imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1920&h=600&fit=crop',
    category: 'Teatro',
    location: 'Teatro Municipal',
    price: 25000,
    capacity: 800,
    date: new Date('2026-02-20T19:00:00')
  },
  {
    title: '🎨 Exposición de Arte Contemporáneo',
    description: 'Una colección única de artistas emergentes latinoamericanos. Explora nuevas formas de expresión artística.',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1920&h=600&fit=crop',
    category: 'Arte',
    location: 'Museo de Arte Contemporáneo',
    price: 8000,
    capacity: 200,
    date: new Date('2026-02-10T10:00:00')
  },
  {
    title: '🎪 Circo del Sol: Nueva Temporada',
    description: 'Espectáculo acrobático mundial con artistas de clase mundial. Una experiencia mágica para toda la familia.',
    imageUrl: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1920&h=600&fit=crop',
    category: 'Entretenimiento',
    location: 'Arena Santiago',
    price: 60000,
    capacity: 3000,
    date: new Date('2026-04-05T18:00:00')
  },
  {
    title: '🎤 Stand Up Comedy Night',
    description: 'Los mejores comediantes del país en una noche llena de risas. Humor inteligente y entretenimiento garantizado.',
    imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1920&h=600&fit=crop',
    category: 'Comedia',
    location: 'Teatro Caupolicán',
    price: 18000,
    capacity: 1200,
    date: new Date('2026-02-28T21:00:00')
  },
  {
    title: '🏃 Maratón de Santiago 2026',
    description: 'La carrera más importante del año. 42K por las calles de Santiago con miles de corredores.',
    imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1920&h=600&fit=crop',
    category: 'Deportes',
    location: 'Parque O\'Higgins',
    price: 15000,
    capacity: 10000,
    date: new Date('2026-04-12T07:00:00')
  },
  {
    title: '🍷 Festival Gastronómico Internacional',
    description: 'Degusta los mejores platos y vinos de chefs reconocidos. Un viaje culinario por el mundo.',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=600&fit=crop',
    category: 'Gastronomía',
    location: 'Centro Cultural Estación Mapocho',
    price: 35000,
    capacity: 500,
    date: new Date('2026-03-22T12:00:00')
  },
  {
    title: '🎸 Concierto de Jazz en el Parque',
    description: 'Tarde de jazz al aire libre con las mejores bandas locales. Ambiente relajado y música de calidad.',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1920&h=600&fit=crop',
    category: 'Música',
    location: 'Parque Bicentenario',
    price: 12000,
    capacity: 2000,
    date: new Date('2026-03-08T17:00:00')
  }
]

async function createTestEvents() {
  try {
    console.log('🎭 Creando eventos de prueba con imágenes...\n')

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
      console.error('❌ No se encontró un organizador. Debes crear un usuario con rol ORGANIZER o ADMIN primero.')
      console.log('💡 Regístrate en http://localhost:3000 y solicita el rol de organizador.')
      return
    }

    console.log(`✅ Organizador encontrado: ${organizer.email}\n`)

    // Crear o encontrar categorías
    const categories = {}
    for (const eventData of testEvents) {
      if (!categories[eventData.category]) {
        let category = await prisma.category.findFirst({
          where: { name: eventData.category }
        })

        if (!category) {
          category = await prisma.category.create({
            data: {
              name: eventData.category,
              description: `Eventos de ${eventData.category.toLowerCase()}`
            }
          })
          console.log(`📁 Categoría creada: ${category.name}`)
        }

        categories[eventData.category] = category
      }
    }

    console.log('\n🎨 Creando eventos...\n')

    // Crear eventos
    let eventsCreated = 0
    for (const eventData of testEvents) {
      try {
        const category = categories[eventData.category]

        const event = await prisma.event.create({
          data: {
            title: eventData.title,
            description: eventData.description,
            imageUrl: eventData.imageUrl,
            startDate: eventData.date,
            endDate: new Date(eventData.date.getTime() + 3 * 60 * 60 * 1000), // +3 horas
            location: eventData.location,
            address: eventData.location,
            organizerId: organizer.id,
            categoryId: category.id,
            isPublished: true,
            capacity: eventData.capacity,
            price: eventData.price,
            isFree: eventData.price === 0
          }
        })

        // Crear ticket type básico
        await prisma.ticketType.create({
          data: {
            eventId: event.id,
            name: 'General',
            price: eventData.price,
            currency: 'CLP',
            capacity: eventData.capacity,
            ticketsGenerated: 0
          }
        })

        console.log(`✅ ${eventData.title}`)
        console.log(`   📍 ${eventData.location}`)
        console.log(`   💰 $${eventData.price.toLocaleString('es-CL')} CLP`)
        console.log(`   📅 ${eventData.date.toLocaleDateString('es-CL')}`)
        console.log(`   🔗 http://localhost:3000/events/${event.id}\n`)

        eventsCreated++
      } catch (error) {
        console.error(`❌ Error creando evento "${eventData.title}":`, error.message)
      }
    }

    console.log(`\n🎉 ¡Proceso completado!`)
    console.log(`📊 ${eventsCreated} eventos creados exitosamente`)
    console.log(`🌐 Ver todos los eventos: http://localhost:3000`)
    console.log(`🎨 El carousel ahora mostrará las imágenes de estos eventos\n`)

  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script
createTestEvents()
