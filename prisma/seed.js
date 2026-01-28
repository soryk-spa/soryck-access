// Seeder completo para desarrollo
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Datos de prueba
const testUsers = [
  {
    clerkId: 'user_admin_test_001',
    email: 'admin@sorykpass.com',
    firstName: 'Admin',
    lastName: 'SorykPass',
    role: 'ADMIN'
  },
  {
    clerkId: 'user_organizer_test_001',
    email: 'organizador1@sorykpass.com',
    firstName: 'María',
    lastName: 'González',
    role: 'ORGANIZER'
  },
  {
    clerkId: 'user_organizer_test_002',
    email: 'organizador2@sorykpass.com',
    firstName: 'Carlos',
    lastName: 'Ramírez',
    role: 'ORGANIZER'
  },
  {
    clerkId: 'user_regular_test_001',
    email: 'usuario1@example.com',
    firstName: 'Juan',
    lastName: 'Pérez',
    role: 'CLIENT'
  },
  {
    clerkId: 'user_regular_test_002',
    email: 'usuario2@example.com',
    firstName: 'Ana',
    lastName: 'Martínez',
    role: 'CLIENT'
  }
]

const testCategories = [
  { name: 'Música', description: 'Conciertos, festivales y eventos musicales' },
  { name: 'Teatro', description: 'Obras de teatro y espectáculos escénicos' },
  { name: 'Deportes', description: 'Eventos deportivos y competencias' },
  { name: 'Arte', description: 'Exposiciones y galerías de arte' },
  { name: 'Comedia', description: 'Stand up y shows de humor' },
  { name: 'Entretenimiento', description: 'Eventos de entretenimiento general' },
  { name: 'Gastronomía', description: 'Eventos culinarios y degustaciones' },
  { name: 'Educación', description: 'Talleres, seminarios y conferencias' }
]

const testRegions = [
  { name: 'Región Metropolitana', code: 'RM' },
  { name: 'Región de Valparaíso', code: 'V' },
  { name: 'Región del Biobío', code: 'VIII' }
]

const testComunas = {
  'RM': [
    'Santiago', 'Providencia', 'Las Condes', 'Vitacura', 'Ñuñoa',
    'La Reina', 'Maipú', 'Puente Alto', 'San Miguel'
  ],
  'V': ['Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué'],
  'VIII': ['Concepción', 'Talcahuano', 'Chiguayante']
}

const testEvents = [
  {
    title: '🎵 Festival de Rock en Vivo 2026',
    description: 'El mejor festival de rock del año con bandas nacionales e internacionales. Una noche inolvidable de música y energía pura. Incluye: Los Bunkers, Los Tres, Chancho en Piedra y más.',
    imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1920&h=600&fit=crop',
    category: 'Música',
    location: 'Estadio Nacional',
    comuna: 'Ñuñoa',
    region: 'RM',
    price: 45000,
    capacity: 5000,
    date: new Date('2026-03-15T20:00:00'),
    isFree: false
  },
  {
    title: '🎭 Romeo y Julieta - Adaptación Moderna',
    description: 'Versión contemporánea del clásico de Shakespeare. Una producción impresionante que no te puedes perder. Dirigida por reconocidos directores nacionales.',
    imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1920&h=600&fit=crop',
    category: 'Teatro',
    location: 'Teatro Municipal de Santiago',
    comuna: 'Santiago',
    region: 'RM',
    price: 25000,
    capacity: 800,
    date: new Date('2026-02-20T19:00:00'),
    isFree: false
  },
  {
    title: '🎨 Exposición: Arte Contemporáneo Latinoamericano',
    description: 'Una colección única de artistas emergentes de toda Latinoamérica. Explora nuevas formas de expresión artística y vanguardia visual.',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1920&h=600&fit=crop',
    category: 'Arte',
    location: 'Museo de Arte Contemporáneo',
    comuna: 'Providencia',
    region: 'RM',
    price: 0,
    capacity: 200,
    date: new Date('2026-02-10T10:00:00'),
    isFree: true
  },
  {
    title: '🎪 Circo del Sol: Alegría',
    description: 'El espectáculo acrobático más esperado del año con artistas de clase mundial. Una experiencia mágica e inolvidable para toda la familia.',
    imageUrl: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1920&h=600&fit=crop',
    category: 'Entretenimiento',
    location: 'Movistar Arena',
    comuna: 'Macul',
    region: 'RM',
    price: 60000,
    capacity: 3000,
    date: new Date('2026-04-05T18:00:00'),
    isFree: false
  },
  {
    title: '🎤 Stand Up Comedy Night',
    description: 'Los mejores comediantes nacionales en una noche llena de risas. Con Edo Caroe, Natalia Valdebenito, y sorpresas especiales.',
    imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1920&h=600&fit=crop',
    category: 'Comedia',
    location: 'Teatro Caupolicán',
    comuna: 'Santiago',
    region: 'RM',
    price: 18000,
    capacity: 1200,
    date: new Date('2026-02-28T21:00:00'),
    isFree: false
  },
  {
    title: '🏃 Maratón Internacional de Santiago 2026',
    description: 'La carrera más importante del año. 42K por las calles de Santiago con miles de corredores de todo el mundo. Incluye categorías 42K, 21K y 10K.',
    imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1920&h=600&fit=crop',
    category: 'Deportes',
    location: 'Parque O\'Higgins',
    comuna: 'Santiago',
    region: 'RM',
    price: 15000,
    capacity: 10000,
    date: new Date('2026-04-12T07:00:00'),
    isFree: false
  },
  {
    title: '🍷 Festival Gastronómico Internacional',
    description: 'Degusta los mejores platos y vinos de chefs reconocidos. Un viaje culinario por diferentes países y culturas. Más de 30 stands gastronómicos.',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=600&fit=crop',
    category: 'Gastronomía',
    location: 'Centro Cultural Estación Mapocho',
    comuna: 'Santiago',
    region: 'RM',
    price: 35000,
    capacity: 500,
    date: new Date('2026-03-22T12:00:00'),
    isFree: false
  },
  {
    title: '🎸 Jazz en el Parque - Tarde de Verano',
    description: 'Tarde de jazz al aire libre con las mejores bandas locales. Ambiente relajado, música de calidad y food trucks. Trae tu manta y disfruta.',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1920&h=600&fit=crop',
    category: 'Música',
    location: 'Parque Bicentenario',
    comuna: 'Vitacura',
    region: 'RM',
    price: 12000,
    capacity: 2000,
    date: new Date('2026-03-08T17:00:00'),
    isFree: false
  },
  {
    title: '🎓 Conferencia: Inteligencia Artificial y Futuro',
    description: 'Los expertos más destacados en IA hablan sobre el futuro de la tecnología. Incluye networking, talleres prácticos y certificado de asistencia.',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&h=600&fit=crop',
    category: 'Educación',
    location: 'Centro de Innovación UC',
    comuna: 'San Joaquín',
    region: 'RM',
    price: 0,
    capacity: 300,
    date: new Date('2026-03-01T09:00:00'),
    isFree: true
  },
  {
    title: '🎹 Concierto Sinfónico: Beethoven',
    description: 'La Orquesta Sinfónica de Chile interpreta las obras más emblemáticas de Beethoven. Una velada de música clásica excepcional.',
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1920&h=600&fit=crop',
    category: 'Música',
    location: 'Teatro Universidad de Chile',
    comuna: 'Santiago',
    region: 'RM',
    price: 20000,
    capacity: 600,
    date: new Date('2026-02-25T20:00:00'),
    isFree: false
  },
  {
    title: '⚽ Partido Amistoso: Chile vs Argentina',
    description: 'Clásico sudamericano en partido amistoso de preparación. No te pierdas este encuentro histórico en el Estadio Nacional.',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1920&h=600&fit=crop',
    category: 'Deportes',
    location: 'Estadio Nacional',
    comuna: 'Ñuñoa',
    region: 'RM',
    price: 30000,
    capacity: 40000,
    date: new Date('2026-03-28T20:00:00'),
    isFree: false
  },
  {
    title: '🎭 Festival de Teatro Callejero',
    description: 'Tres días de teatro al aire libre con compañías nacionales e internacionales. Arte accesible para todos en las calles de Valparaíso.',
    imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1920&h=600&fit=crop',
    category: 'Teatro',
    location: 'Plaza Sotomayor',
    comuna: 'Valparaíso',
    region: 'V',
    price: 0,
    capacity: 1000,
    date: new Date('2026-04-18T15:00:00'),
    isFree: true
  }
]

async function seed() {
  try {
    console.log('🌱 Iniciando seeder de desarrollo...\n')

    // Limpiar datos existentes (solo en desarrollo)
    console.log('🧹 Limpiando base de datos...')
    await prisma.ticket.deleteMany()
    await prisma.order.deleteMany()
    await prisma.ticketType.deleteMany()
    await prisma.promoCode.deleteMany()
    await prisma.event.deleteMany()
    await prisma.comuna.deleteMany()
    await prisma.region.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()
    console.log('✅ Base de datos limpia\n')

    // Crear usuarios
    console.log('👥 Creando usuarios de prueba...')
    const users = {}
    for (const userData of testUsers) {
      const user = await prisma.user.create({
        data: userData
      })
      users[userData.role + userData.email] = user
      console.log(`✅ ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`)
    }
    console.log('')

    // Crear categorías
    console.log('📁 Creando categorías...')
    const categories = {}
    for (const catData of testCategories) {
      const category = await prisma.category.create({
        data: catData
      })
      categories[category.name] = category
      console.log(`✅ ${category.name}`)
    }
    console.log('')

    // Crear regiones y comunas
    console.log('🗺️  Creando regiones y comunas...')
    const regions = {}
    const comunas = {}

    for (const regionData of testRegions) {
      const region = await prisma.region.create({
        data: regionData
      })
      regions[region.code] = region
      console.log(`✅ ${region.name}`)

      // Crear comunas para esta región
      const comunasData = testComunas[region.code]
      for (const comunaName of comunasData) {
        const comuna = await prisma.comuna.create({
          data: {
            name: comunaName,
            regionId: region.id
          }
        })
        comunas[`${region.code}-${comunaName}`] = comuna
      }
    }
    console.log('')

    // Crear eventos
    console.log('🎨 Creando eventos con imágenes...')
    const organizers = Object.values(users).filter(u => u.role === 'ORGANIZER')
    let eventIndex = 0

    for (const eventData of testEvents) {
      try {
        const organizer = organizers[eventIndex % organizers.length]
        const category = categories[eventData.category]
        const region = regions[eventData.region]
        const comuna = comunas[`${eventData.region}-${eventData.comuna}`]

        const event = await prisma.event.create({
          data: {
            title: eventData.title,
            description: eventData.description,
            imageUrl: eventData.imageUrl,
            startDate: eventData.date,
            endDate: new Date(eventData.date.getTime() + 3 * 60 * 60 * 1000),
            location: eventData.location,
            address: eventData.location,
            organizerId: organizer.id,
            categoryId: category.id,
            regionId: region?.id,
            comunaId: comuna?.id,
            region: eventData.region,
            comuna: eventData.comuna,
            isPublished: true,
            capacity: eventData.capacity,
            price: eventData.price,
            isFree: eventData.isFree
          }
        })

        // Crear tipos de tickets
        const ticketTypes = [
          {
            name: 'General',
            price: eventData.price,
            capacity: Math.floor(eventData.capacity * 0.6)
          },
          {
            name: 'VIP',
            price: eventData.price * 1.5,
            capacity: Math.floor(eventData.capacity * 0.3)
          },
          {
            name: 'Early Bird',
            price: eventData.price * 0.8,
            capacity: Math.floor(eventData.capacity * 0.1)
          }
        ]

        for (const ttData of ticketTypes) {
          await prisma.ticketType.create({
            data: {
              eventId: event.id,
              name: ttData.name,
              price: ttData.price,
              currency: 'CLP',
              capacity: ttData.capacity,
              ticketsGenerated: 0
            }
          })
        }

        // Crear algunos códigos promocionales
        if (eventIndex % 3 === 0) {
          await prisma.promoCode.create({
            data: {
              code: `PROMO${eventIndex + 1}`,
              name: `Descuento 15%`,
              description: `15% de descuento para ${eventData.title}`,
              eventId: event.id,
              type: 'PERCENTAGE',
              value: 15,
              status: 'ACTIVE',
              usageLimit: 100,
              usedCount: 0,
              validFrom: new Date(),
              validUntil: eventData.date,
              createdBy: organizer.id
            }
          })
        }

        console.log(`✅ ${eventData.title}`)
        console.log(`   📍 ${eventData.location} - ${eventData.comuna}`)
        console.log(`   💰 ${eventData.isFree ? 'GRATIS' : '$' + eventData.price.toLocaleString('es-CL') + ' CLP'}`)
        console.log(`   👥 Organizador: ${organizer.firstName} ${organizer.lastName}`)
        console.log(`   🎫 ${ticketTypes.length} tipos de tickets creados`)
        console.log('')

        eventIndex++
      } catch (error) {
        console.error(`❌ Error creando evento "${eventData.title}":`, error.message)
      }
    }

    console.log('\n🎉 ¡Seeder completado exitosamente!\n')
    console.log('📊 Resumen:')
    console.log(`   👥 ${testUsers.length} usuarios creados`)
    console.log(`   📁 ${testCategories.length} categorías creadas`)
    console.log(`   🗺️  ${testRegions.length} regiones y ${Object.keys(comunas).length} comunas creadas`)
    console.log(`   🎨 ${eventIndex} eventos creados con imágenes`)
    console.log('')
    console.log('🔑 Credenciales de prueba:')
    console.log('   Admin: admin@sorykpass.com')
    console.log('   Organizador 1: organizador1@sorykpass.com')
    console.log('   Organizador 2: organizador2@sorykpass.com')
    console.log('   Usuario 1: usuario1@example.com')
    console.log('   Usuario 2: usuario2@example.com')
    console.log('')
    console.log('🌐 Ver la plataforma: http://localhost:3000')
    console.log('🎨 El carousel mostrará las imágenes de los eventos\n')

  } catch (error) {
    console.error('❌ Error en seeder:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar seeder
seed()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
