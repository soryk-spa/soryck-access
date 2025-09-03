import { writeFileSync, mkdirSync, existsSync, readdirSync, statSync, unlinkSync } from 'fs'
import { join } from 'path'
import { generateTicketQRAsBuffer, TicketQRData } from './qr'
import { logger } from './logger'

export async function saveQRToPublicFolder(ticketData: TicketQRData): Promise<string> {
  try {
  logger.debug(`[QR Storage] Guardando QR para ticket: ${ticketData.ticketId}`)
    
    const qrDir = join(process.cwd(), 'public', 'qr')
    if (!existsSync(qrDir)) {
  logger.debug(`[QR Storage] Creando directorio: ${qrDir}`)
      mkdirSync(qrDir, { recursive: true })
    }

    const qrBuffer = await generateTicketQRAsBuffer(ticketData)
    
    const filename = `${ticketData.qrCode}.png`
    const filePath = join(qrDir, filename)
    
    writeFileSync(filePath, qrBuffer)
  logger.info(`[QR Storage] ✅ QR guardado en: ${filePath}`)
    
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/qr/${filename}`
  logger.debug(`[QR Storage] 🌐 URL pública: ${publicUrl}`)
    
    return publicUrl
  } catch (error) {
  logger.error('[QR Storage] ❌ Error guardando QR:', error as Error)
    throw new Error(`Error al guardar QR: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
}

export async function saveMultipleQRs(ticketsData: TicketQRData[]): Promise<Array<{ qrCode: string; qrImageUrl: string }>> {
  const results = []
  
  logger.info(`[QR Storage] Guardando ${ticketsData.length} QRs...`)
  
  for (let i = 0; i < ticketsData.length; i++) {
    const ticketData = ticketsData[i]
    try {
      const qrImageUrl = await saveQRToPublicFolder(ticketData)
      results.push({
        qrCode: ticketData.qrCode,
        qrImageUrl
      })
  logger.info(`[QR Storage] ✅ QR ${i + 1}/${ticketsData.length} guardado`)
    } catch (error) {
  logger.error(`[QR Storage] ❌ Error guardando QR ${i + 1}:`, error as Error)
      results.push({
        qrCode: ticketData.qrCode,
        qrImageUrl: ''
      })
    }
  }
  
  logger.info(`[QR Storage] 🎯 Proceso completado: ${results.filter(r => r.qrImageUrl).length}/${results.length} exitosos`)
  return results
}

export function cleanupOldQRs(daysOld: number = 7): void {
  try {
    const qrDir = join(process.cwd(), 'public', 'qr')
    if (!existsSync(qrDir)) return
    
    const files = readdirSync(qrDir)
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000)
    
    let cleanedCount = 0
    files.forEach((file: string) => {
      const filePath = join(qrDir, file)
      const stats = statSync(filePath)
      
      if (stats.mtime.getTime() < cutoff) {
        unlinkSync(filePath)
        cleanedCount++
      }
    })
    
    if (cleanedCount > 0) {
      logger.info(`[QR Storage] 🧹 Limpiados ${cleanedCount} QRs antiguos`)
    }
  } catch (error) {
  logger.error('[QR Storage] ⚠️ Error en limpieza de QRs:', error as Error)
  }
}