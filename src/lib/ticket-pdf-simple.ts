import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import QRCode from 'qrcode'

interface SimpleTicketData {
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
 * Genera un PDF de ticket con código QR usando pdf-lib
 * (alternativa a PDFKit que funciona mejor en serverless)
 * @returns Buffer del PDF generado
 */
export async function generateSimpleTicketPDF(ticketData: SimpleTicketData): Promise<Buffer> {
  try {
    // Crear nuevo documento PDF
    const pdfDoc = await PDFDocument.create()
    
    // Agregar una página (tamaño aproximado de ticket: 400x600 puntos)
    const page = pdfDoc.addPage([400, 600])
    
    // Cargar fuentes estándar embebidas (no requiere archivos externos)
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    // Dimensiones de la página
    const { width, height } = page.getSize()
    
    // === HEADER CON COLOR ===
    page.drawRectangle({
      x: 0,
      y: height - 80,
      width: width,
      height: 80,
      color: rgb(0, 0.33, 0.8), // #0053CC
    })
    
    // Título del header
    page.drawText('TU ENTRADA', {
      x: 30,
      y: height - 45,
      size: 16,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    })
    
    // Nombre del evento
    const eventName = ticketData.eventName.length > 35 
      ? ticketData.eventName.substring(0, 32) + '...' 
      : ticketData.eventName
    
    page.drawText(eventName, {
      x: 30,
      y: height - 68,
      size: 11,
      font: helveticaFont,
      color: rgb(0.9, 0.9, 0.9),
    })
    
    // === INFORMACIÓN DEL EVENTO ===
    let yPos = height - 120
    
    // Asistente
    page.drawText('ASISTENTE:', {
      x: 30,
      y: yPos,
      size: 9,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    })
    yPos -= 18
    page.drawText(ticketData.userName, {
      x: 30,
      y: yPos,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    })
    
    yPos -= 30
    
    // Fecha del evento
    page.drawText('FECHA DEL EVENTO:', {
      x: 30,
      y: yPos,
      size: 9,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    })
    yPos -= 18
    page.drawText(ticketData.eventDate, {
      x: 30,
      y: yPos,
      size: 11,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    })
    
    yPos -= 30
    
    // Ubicación
    page.drawText('UBICACIÓN:', {
      x: 30,
      y: yPos,
      size: 9,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    })
    yPos -= 18
    const location = ticketData.eventLocation.length > 40
      ? ticketData.eventLocation.substring(0, 37) + '...'
      : ticketData.eventLocation
    page.drawText(location, {
      x: 30,
      y: yPos,
      size: 11,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    })
    
    // Información de asiento (si existe)
    if (ticketData.seatInfo) {
      yPos -= 30
      
      page.drawText('TU ASIENTO:', {
        x: 30,
        y: yPos,
        size: 9,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.4),
      })
      yPos -= 18
      
      const seatText = `Sección ${ticketData.seatInfo.sectionName} - Fila ${ticketData.seatInfo.row} - Asiento ${ticketData.seatInfo.number}`
      page.drawText(seatText, {
        x: 30,
        y: yPos,
        size: 11,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      })
    }
    
    // === CÓDIGO QR ===
    yPos -= 50
    
    // Generar QR code como PNG buffer
    const qrBuffer = await QRCode.toBuffer(ticketData.qrCode, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 200,
      margin: 1,
    })
    
    // Embedir imagen QR en el PDF
    const qrImage = await pdfDoc.embedPng(qrBuffer)
    const qrDims = qrImage.scale(0.8)
    
    page.drawImage(qrImage, {
      x: (width - qrDims.width) / 2,
      y: yPos - qrDims.height,
      width: qrDims.width,
      height: qrDims.height,
    })
    
    yPos -= qrDims.height + 20
    
    // Texto del QR
    page.drawText('Presenta este código QR en la entrada', {
      x: 30,
      y: yPos,
      size: 9,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    })
    
    // === FOOTER ===
    page.drawText(`Orden: ${ticketData.orderNumber}`, {
      x: 30,
      y: 40,
      size: 8,
      font: helveticaFont,
      color: rgb(0.6, 0.6, 0.6),
    })
    
    page.drawText(`Ticket #${ticketData.ticketNumber}`, {
      x: 30,
      y: 25,
      size: 8,
      font: helveticaFont,
      color: rgb(0.6, 0.6, 0.6),
    })
    
    page.drawText('www.sorykpass.com', {
      x: width - 120,
      y: 25,
      size: 8,
      font: helveticaFont,
      color: rgb(0.6, 0.6, 0.6),
    })
    
    // Guardar el PDF como buffer
    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
    
  } catch (error) {
    console.error('Error generando PDF con pdf-lib:', error)
    throw error
  }
}

/**
 * Genera múltiples PDFs de tickets
 */
export async function generateMultipleSimpleTicketPDFs(
  tickets: SimpleTicketData[]
): Promise<Buffer[]> {
  return Promise.all(tickets.map(ticket => generateSimpleTicketPDF(ticket)))
}
