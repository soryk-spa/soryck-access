import { WebpayPlus, Environment, IntegrationApiKeys, IntegrationCommerceCodes } from 'transbank-sdk'
import { logger } from './logger'

logger.debug('=== CONFIGURACIÓN DE TRANSBANK ===', {
  TRANSBANK_ENVIRONMENT: process.env.TRANSBANK_ENVIRONMENT,
  NODE_ENV: process.env.NODE_ENV,
})

const environment = process.env.TRANSBANK_ENVIRONMENT === 'production' 
  ? Environment.Production 
  : Environment.Integration

const commerceCode = process.env.TRANSBANK_ENVIRONMENT === 'production'
  ? process.env.TRANSBANK_COMMERCE_CODE!
  : IntegrationCommerceCodes.WEBPAY_PLUS

const apiKey = process.env.TRANSBANK_ENVIRONMENT === 'production'
  ? process.env.TRANSBANK_API_KEY!
  : IntegrationApiKeys.WEBPAY

logger.debug('Configuración Transbank', {
  environment: environment === Environment.Production ? 'Production' : 'Integration',
  commerceCode,
  apiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined',
  isProduction: environment === Environment.Production
})

if (process.env.TRANSBANK_ENVIRONMENT === 'production') {
  if (!process.env.TRANSBANK_COMMERCE_CODE) {
    logger.error('❌ TRANSBANK_COMMERCE_CODE no está definido para producción')
    throw new Error('TRANSBANK_COMMERCE_CODE es requerido para producción')
  }
  
  if (!process.env.TRANSBANK_API_KEY) {
    logger.error('❌ TRANSBANK_API_KEY no está definido para producción')
    throw new Error('TRANSBANK_API_KEY es requerido para producción')
  }
  
  logger.info('✅ Configuración de producción validada')
} else {
  logger.info('✅ Usando configuración de integración (testing)')
  logger.debug('Commerce Code (Integration)', { code: IntegrationCommerceCodes.WEBPAY_PLUS })
  logger.debug('API Key (Integration)', { apiKeyPreview: IntegrationApiKeys.WEBPAY ? `${IntegrationApiKeys.WEBPAY.substring(0, 10)}...` : 'undefined' })
}

export const webpayPlus = new WebpayPlus.Transaction({
  commerceCode,
  apiKey,
  environment
})

logger.info('WebpayPlus instance created successfully')

export { Environment, IntegrationApiKeys, IntegrationCommerceCodes }