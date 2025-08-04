import { WebpayPlus, Environment, IntegrationApiKeys, IntegrationCommerceCodes } from 'transbank-sdk'

console.log('=== CONFIGURACIÓN DE TRANSBANK ===')
console.log('TRANSBANK_ENVIRONMENT:', process.env.TRANSBANK_ENVIRONMENT)
console.log('NODE_ENV:', process.env.NODE_ENV)

const environment = process.env.TRANSBANK_ENVIRONMENT === 'production' 
  ? Environment.Production 
  : Environment.Integration

const commerceCode = process.env.TRANSBANK_ENVIRONMENT === 'production'
  ? process.env.TRANSBANK_COMMERCE_CODE!
  : IntegrationCommerceCodes.WEBPAY_PLUS

const apiKey = process.env.TRANSBANK_ENVIRONMENT === 'production'
  ? process.env.TRANSBANK_API_KEY!
  : IntegrationApiKeys.WEBPAY

console.log('Configuración Transbank:', {
  environment: environment === Environment.Production ? 'Production' : 'Integration',
  commerceCode: commerceCode,
  apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined',
  isProduction: environment === Environment.Production
})

if (process.env.TRANSBANK_ENVIRONMENT === 'production') {
  if (!process.env.TRANSBANK_COMMERCE_CODE) {
    console.error('❌ TRANSBANK_COMMERCE_CODE no está definido para producción')
    throw new Error('TRANSBANK_COMMERCE_CODE es requerido para producción')
  }
  
  if (!process.env.TRANSBANK_API_KEY) {
    console.error('❌ TRANSBANK_API_KEY no está definido para producción')
    throw new Error('TRANSBANK_API_KEY es requerido para producción')
  }
  
  console.log('✅ Configuración de producción validada')
} else {
  console.log('✅ Usando configuración de integración (testing)')
  console.log('Commerce Code (Integration):', IntegrationCommerceCodes.WEBPAY_PLUS)
  console.log('API Key (Integration):', IntegrationApiKeys.WEBPAY ? `${IntegrationApiKeys.WEBPAY.substring(0, 10)}...` : 'undefined')
}

export const webpayPlus = new WebpayPlus.Transaction({
  commerceCode,
  apiKey,
  environment
})

console.log('WebpayPlus instance created successfully')

export { Environment, IntegrationApiKeys, IntegrationCommerceCodes }