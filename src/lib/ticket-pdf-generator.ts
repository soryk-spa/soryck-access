import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'

interface TicketData {
  qrCode: string
  eventName: string
  eventDate: string
  eventLocation: string
  orderNumber: string
  ticketNumber: number
  userName: string
  seatInfo?: {
    sectionName: string
    row: string
    number: string
    sectionColor?: string
  }
  ticketTypeName?: string
}

/**
 * Genera un PDF de ticket con código QR
 * @returns Buffer del PDF generado
 */
export async function generateTicketPDF(ticketData: TicketData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Generar QR code como buffer
      const qrBuffer = await QRCode.toBuffer(ticketData.qrCode, {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: 300,
        margin: 1,
      })

      // Crear documento PDF
      const doc = new PDFDocument({
        size: [400, 600], // Tamaño tipo ticket (ancho x alto en puntos)
        margins: {
          top: 30,
          bottom: 30,
          left: 30,
          right: 30,
        },
      })

      const chunks: Buffer[] = []

      // Capturar el PDF en memoria
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // === DISEÑO DEL TICKET ===

      // Header con gradiente (simulado con rectángulos)
      doc
        .rect(0, 0, 400, 80)
        .fill('#0053CC')

      // Logo/Icono del evento
      doc
        .fontSize(32)
        .fillColor('#FFFFFF')
        .text('🎫', 20, 25)

      // Título del header
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#FFFFFF')
        .text('TU ENTRADA', 70, 30, { width: 310 })

      // Nombre del evento
      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#E0E0E0')
        .text(ticketData.eventName, 70, 50, { width: 310, ellipsis: true })

      // === INFORMACIÓN DEL EVENTO ===
      let yPosition = 100

      // Nombre del asistente
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('ASISTENTE:', 30, yPosition)

      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#000000')
        .text(ticketData.userName, 30, yPosition + 15, { width: 340 })

      yPosition += 45

      // Fecha
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('FECHA Y HORA:', 30, yPosition)

      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#000000')
        .text(ticketData.eventDate, 30, yPosition + 15, { width: 340 })

      yPosition += 45

      // Ubicación
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('UBICACIÓN:', 30, yPosition)

      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#000000')
        .text(ticketData.eventLocation, 30, yPosition + 15, { width: 340 })

      yPosition += 45

      // Información de asiento (si existe)
      if (ticketData.seatInfo) {
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#333333')
          .text('ASIENTO:', 30, yPosition)

        const seatText = `${ticketData.seatInfo.sectionName} • Fila ${ticketData.seatInfo.row} • Asiento ${ticketData.seatInfo.number}`
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#0053CC')
          .text(seatText, 30, yPosition + 15, { width: 340 })

        yPosition += 50
      } else if (ticketData.ticketTypeName) {
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#333333')
          .text('TIPO:', 30, yPosition)

        doc
          .fontSize(11)
          .font('Helvetica')
          .fillColor('#000000')
          .text(ticketData.ticketTypeName, 30, yPosition + 15, { width: 340 })

        yPosition += 45
      }

      // Línea divisoria
      doc
        .strokeColor('#E0E0E0')
        .lineWidth(1)
        .moveTo(30, yPosition)
        .lineTo(370, yPosition)
        .stroke()

      yPosition += 20

      // === CÓDIGO QR ===
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('CÓDIGO QR DE ENTRADA:', 30, yPosition, { align: 'center', width: 340 })

      yPosition += 20

      // Insertar imagen QR (centrada)
      const qrSize = 180
      const qrX = (400 - qrSize) / 2
      doc.image(qrBuffer, qrX, yPosition, {
        width: qrSize,
        height: qrSize,
      })

      yPosition += qrSize + 15

      // Número de orden (pequeño, debajo del QR)
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#999999')
        .text(`Orden: ${ticketData.orderNumber}`, 30, yPosition, { align: 'center', width: 340 })

      doc
        .fontSize(8)
        .fillColor('#999999')
        .text(`Ticket #${ticketData.ticketNumber}`, 30, yPosition + 12, { align: 'center', width: 340 })

      // Footer con instrucciones
      yPosition += 35
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#666666')
        .text(
          '⚠️ Presenta este código QR en la entrada del evento.\nNo compartas este código con nadie.',
          30,
          yPosition,
          { align: 'center', width: 340, lineGap: 3 }
        )

      // Finalizar el PDF
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Genera múltiples PDFs de tickets (uno por ticket)
 * @returns Array de buffers de PDFs
 */
export async function generateMultipleTicketPDFs(
  tickets: Omit<TicketData, 'ticketNumber'>[],
  baseInfo: {
    eventName: string
    eventDate: string
    eventLocation: string
    orderNumber: string
    userName: string
  }
): Promise<Buffer[]> {
  const pdfPromises = tickets.map((ticket, index) =>
    generateTicketPDF({
      ...baseInfo,
      qrCode: ticket.qrCode,
      seatInfo: ticket.seatInfo,
      ticketTypeName: ticket.ticketTypeName,
      ticketNumber: index + 1,
    })
  )

  return Promise.all(pdfPromises)
}
