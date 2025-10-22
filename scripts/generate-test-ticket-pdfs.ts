/**
 * Script para generar PDFs de tickets de prueba con el logo de SorykPass
 * Ejecutar: npx tsx scripts/generate-test-ticket-pdfs.ts
 */

import fs from 'fs'
import path from 'path'
import { generateTicketPDF, generateMultipleTicketPDFs } from '../src/lib/ticket-pdf-generator'

async function generateTestTickets() {
  console.log('🎫 Generando PDFs de tickets de prueba con logo SorykPass...\n')

  const outputDir = path.join(process.cwd(), 'output')
  
  // Crear directorio de salida si no existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Datos de ejemplo
  const baseTicketData = {
    eventName: 'Concierto de Rock - The Best Band',
    eventDate: 'Sábado, 25 de octubre de 2025, 20:00',
    eventLocation: 'Teatro Municipal de Santiago',
    orderNumber: 'ORD-2025-ABC123',
    userName: 'Juan Pérez González',
  }

  // === TICKET 1: Con asiento VIP ===
  console.log('📄 Generando Ticket #1 - VIP con asiento...')
  const ticket1 = await generateTicketPDF({
    ...baseTicketData,
    qrCode: 'TICKET-VIP-001-ABC123',
    ticketNumber: 1,
    seatInfo: {
      sectionName: 'VIP',
      row: 'A',
      number: '12',
      sectionColor: '#FFD700',
    },
  })

  fs.writeFileSync(
    path.join(outputDir, 'ticket-vip-con-asiento.pdf'),
    ticket1
  )
  console.log('✅ Guardado: output/ticket-vip-con-asiento.pdf\n')

  // === TICKET 2: Admisión general ===
  console.log('📄 Generando Ticket #2 - Admisión General...')
  const ticket2 = await generateTicketPDF({
    ...baseTicketData,
    qrCode: 'TICKET-GENERAL-002-ABC123',
    ticketNumber: 2,
    ticketTypeName: 'Admisión General',
  })

  fs.writeFileSync(
    path.join(outputDir, 'ticket-admision-general.pdf'),
    ticket2
  )
  console.log('✅ Guardado: output/ticket-admision-general.pdf\n')

  // === TICKET 3: Cortesía ===
  console.log('📄 Generando Ticket #3 - Cortesía...')
  const ticket3 = await generateTicketPDF({
    eventName: 'Festival de Música Electrónica 2025',
    eventDate: 'Viernes, 15 de noviembre de 2025, 22:00',
    eventLocation: 'Movistar Arena',
    orderNumber: 'CORTESÍA-XYZ789',
    userName: 'María González',
    qrCode: 'COURTESY-TICKET-003-XYZ789',
    ticketNumber: 1,
    seatInfo: {
      sectionName: 'Platea Alta',
      row: 'G',
      number: '45',
      sectionColor: '#4CAF50',
    },
  })

  fs.writeFileSync(
    path.join(outputDir, 'ticket-cortesia.pdf'),
    ticket3
  )
  console.log('✅ Guardado: output/ticket-cortesia.pdf\n')

  // === MÚLTIPLES TICKETS ===
  console.log('📄 Generando múltiples tickets (orden de 3 tickets)...')
  const multipleTickets = await generateMultipleTicketPDFs(
    [
      {
        qrCode: 'MULTI-001',
        eventName: '',
        eventDate: '',
        eventLocation: '',
        orderNumber: '',
        userName: '',
        seatInfo: { sectionName: 'Platea', row: 'B', number: '10' },
      },
      {
        qrCode: 'MULTI-002',
        eventName: '',
        eventDate: '',
        eventLocation: '',
        orderNumber: '',
        userName: '',
        seatInfo: { sectionName: 'Platea', row: 'B', number: '11' },
      },
      {
        qrCode: 'MULTI-003',
        eventName: '',
        eventDate: '',
        eventLocation: '',
        orderNumber: '',
        userName: '',
        seatInfo: { sectionName: 'Platea', row: 'B', number: '12' },
      },
    ],
    {
      eventName: 'Stand Up Comedy Night',
      eventDate: 'Domingo, 3 de noviembre de 2025, 19:30',
      eventLocation: 'Teatro Caupolicán',
      orderNumber: 'ORD-MULTI-456',
      userName: 'Carlos Rodríguez',
    }
  )

  multipleTickets.forEach((pdfBuffer, index) => {
    fs.writeFileSync(
      path.join(outputDir, `ticket-multiple-${index + 1}.pdf`),
      pdfBuffer
    )
    console.log(`✅ Guardado: output/ticket-multiple-${index + 1}.pdf`)
  })

  console.log('\n🎉 ¡Todos los PDFs de prueba generados exitosamente!')
  console.log(`📁 Revisa la carpeta: ${outputDir}\n`)
  console.log('💡 Ahora todos los PDFs incluyen el logo de SorykPass en el header!\n')
}

// Ejecutar
generateTestTickets().catch((error) => {
  console.error('❌ Error generando PDFs:', error)
  process.exit(1)
})
