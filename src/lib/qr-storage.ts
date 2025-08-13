import { writeFileSync, mkdirSync, existsSync, readdirSync, statSync, unlinkSync } from 'fs'
import { join } from 'path'
import { generateTicketQRAsBuffer, TicketQRData } from './qr'

export async function saveQRToPublicFolder(ticketData: TicketQRData): Promise<string> {
  try {
    console.log(`[QR Storage] Guardando QR para ticket: ${ticketData.ticketId}`)
    
    const qrDir = join(process.cwd(), 'public', 'qr')
    if (!existsSync(qrDir)) {
      console.log(`[QR Storage] Creando directorio: ${qrDir}`)
      mkdirSync(qrDir, { recursive: true })
    }

    const qrBuffer = await generateTicketQRAsBuffer(ticketData)
    
    const filename = `${ticketData.qrCode}.png`
    const filePath = join(qrDir, filename)
    
    writeFileSync(filePath, qrBuffer)
    console.log(`[QR Storage] ✅ QR guardado en: ${filePath}`)
    
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/qr/${filename}`
    console.log(`[QR Storage] 🌐 URL pública: ${publicUrl}`)
    
    return publicUrl
  } catch (error) {
    console.error('[QR Storage] ❌ Error guardando QR:', error)
    throw new Error(`Error al guardar QR: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
}

export async function saveMultipleQRs(ticketsData: TicketQRData[]): Promise<Array<{ qrCode: string; qrImageUrl: string }>> {
  const results = []
  
  console.log(`[QR Storage] Guardando ${ticketsData.length} QRs...`)
  
  for (let i = 0; i < ticketsData.length; i++) {
    const ticketData = ticketsData[i]
    try {
      const qrImageUrl = await saveQRToPublicFolder(ticketData)
      results.push({
        qrCode: ticketData.qrCode,
        qrImageUrl
      })
      console.log(`[QR Storage] ✅ QR ${i + 1}/${ticketsData.length} guardado`)
    } catch (error) {
      console.error(`[QR Storage] ❌ Error guardando QR ${i + 1}:`, error)
      results.push({
        qrCode: ticketData.qrCode,
        qrImageUrl: ''
      })
    }
  }
  
  console.log(`[QR Storage] 🎯 Proceso completado: ${results.filter(r => r.qrImageUrl).length}/${results.length} exitosos`)
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
      console.log(`[QR Storage] 🧹 Limpiados ${cleanedCount} QRs antiguos`)
    }
  } catch (error) {
    console.warn('[QR Storage] ⚠️ Error en limpieza de QRs:', error)
  }
}