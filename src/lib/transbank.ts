import { WebpayPlus, Environment, IntegrationApiKeys, IntegrationCommerceCodes } from 'transbank-sdk'

const environment = process.env.TRANSBANK_ENVIRONMENT === 'production' 
  ? Environment.Production 
  : Environment.Integration

const commerceCode = process.env.TRANSBANK_ENVIRONMENT === 'production'
  ? process.env.TRANSBANK_COMMERCE_CODE!
  : IntegrationCommerceCodes.WEBPAY_PLUS

const apiKey = process.env.TRANSBANK_ENVIRONMENT === 'production'
  ? process.env.TRANSBANK_API_KEY!
  : IntegrationApiKeys.WEBPAY

export const webpayPlus = new WebpayPlus.Transaction({
  commerceCode,
  apiKey,
  environment
})

export { Environment, IntegrationApiKeys, IntegrationCommerceCodes }