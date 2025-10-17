/**
 * Script para generar un PDF de ticket de prueba
 * Ejecutar con: npx tsx scripts/generate-sample-ticket.ts
 */

import { generateTicketPDF } from '../src/lib/ticket-pdf-generator'
import fs from 'fs'
import path from 'path'

async function generateSampleTicket() {
  console.log('🎫 Generando ticket de prueba...\n')

  const sampleTicketData = {
    qrCode: 'SAMPLE-TICKET-123456789',
    eventName: 'Concierto de Rock en Vivo 2025',
    eventDate: 'Sábado, 25 de octubre de 2025, 20:00',
    eventLocation: 'Teatro Municipal de Santiago - Sala Principal',
    orderNumber: 'ORD-2025-001234',
    ticketNumber: 1,
    userName: 'Juan Pérez García',
    seatInfo: {
      sectionName: 'VIP Platea',
      row: 'A',
      number: '12',
      sectionColor: '#0053CC',
    },
  }

  try {
    console.log('📝 Datos del ticket:')
    console.log('   - Evento:', sampleTicketData.eventName)
    console.log('   - Fecha:', sampleTicketData.eventDate)
    console.log('   - Ubicación:', sampleTicketData.eventLocation)
    console.log('   - Asiento:', `${sampleTicketData.seatInfo.sectionName} - Fila ${sampleTicketData.seatInfo.row}, Asiento ${sampleTicketData.seatInfo.number}`)
    console.log('   - Cliente:', sampleTicketData.userName)
    console.log('   - Orden:', sampleTicketData.orderNumber)
    console.log('')

    // Generar el PDF
    const pdfBuffer = await generateTicketPDF(sampleTicketData)

    // Crear directorio de salida si no existe
    const outputDir = path.join(process.cwd(), 'output')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Guardar el PDF
    const outputPath = path.join(outputDir, 'ticket-sample.pdf')
    fs.writeFileSync(outputPath, pdfBuffer)

    console.log('✅ ¡Ticket generado exitosamente!')
    console.log(`📄 Archivo guardado en: ${outputPath}`)
    console.log(`📊 Tamaño: ${(pdfBuffer.length / 1024).toFixed(2)} KB`)
    console.log('')
    console.log('💡 Puedes abrir el archivo con cualquier lector de PDF')
    console.log('')

    // También generar uno sin asiento asignado (admisión general)
    console.log('🎫 Generando ticket de admisión general...\n')

    const generalAdmissionTicket = {
      qrCode: 'SAMPLE-GENERAL-987654321',
      eventName: 'Festival de Música Electrónica',
      eventDate: 'Viernes, 1 de noviembre de 2025, 22:00',
      eventLocation: 'Parque Bicentenario - Escenario Principal',
      orderNumber: 'ORD-2025-005678',
      ticketNumber: 1,
      userName: 'María Rodríguez López',
      ticketTypeName: 'Entrada General',
    }

    const generalPdfBuffer = await generateTicketPDF(generalAdmissionTicket)
    const generalOutputPath = path.join(outputDir, 'ticket-sample-general.pdf')
    fs.writeFileSync(generalOutputPath, generalPdfBuffer)

    console.log('✅ ¡Ticket de admisión general generado!')
    console.log(`📄 Archivo guardado en: ${generalOutputPath}`)
    console.log(`📊 Tamaño: ${(generalPdfBuffer.length / 1024).toFixed(2)} KB`)
    console.log('')

    // Generar ticket de cortesía
    console.log('🎫 Generando ticket de cortesía...\n')

    const courtesyTicket = {
      qrCode: 'CORTESIA-SAMPLE-111222333',
      eventName: 'Stand-Up Comedy Night',
      eventDate: 'Jueves, 31 de octubre de 2025, 21:00',
      eventLocation: 'Club de Comedia Santiago',
      orderNumber: 'CORTESÍA-ABC123',
      ticketNumber: 1,
      userName: 'Carlos Martínez',
      seatInfo: {
        sectionName: 'Preferencial',
        row: 'C',
        number: '8',
        sectionColor: '#CC66CC',
      },
      ticketTypeName: 'Cortesía VIP',
    }

    const courtesyPdfBuffer = await generateTicketPDF(courtesyTicket)
    const courtesyOutputPath = path.join(outputDir, 'ticket-sample-courtesy.pdf')
    fs.writeFileSync(courtesyOutputPath, courtesyPdfBuffer)

    console.log('✅ ¡Ticket de cortesía generado!')
    console.log(`📄 Archivo guardado en: ${courtesyOutputPath}`)
    console.log(`📊 Tamaño: ${(courtesyPdfBuffer.length / 1024).toFixed(2)} KB`)
    console.log('')

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 ¡Proceso completado exitosamente!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('📂 Se generaron 3 tickets de ejemplo:')
    console.log('   1. ticket-sample.pdf - Ticket con asiento numerado')
    console.log('   2. ticket-sample-general.pdf - Ticket de admisión general')
    console.log('   3. ticket-sample-courtesy.pdf - Ticket de cortesía')
    console.log('')
    console.log('📱 Puedes escanear los códigos QR con tu celular')
    console.log('🖨️  O imprimir los tickets para probar en físico')
    console.log('')
  } catch (error) {
    console.error('❌ Error generando el ticket:', error)
    process.exit(1)
  }
}

// Ejecutar
generateSampleTicket()
