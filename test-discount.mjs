// Test para verificar cálculos de descuentos
const COMMISSION_RATE = 0.06; // 6%

function calculatePriceBreakdown(basePrice, currency = 'CLP') {
  if (basePrice === 0) {
    return {
      basePrice: 0,
      commission: 0,
      totalPrice: 0,
      currency,
      originalAmount: 0,
      discountAmount: 0
    };
  }

  const commission = Math.round(basePrice * COMMISSION_RATE);
  const totalPrice = basePrice + commission;

  return {
    basePrice,
    commission,
    totalPrice,
    currency,
    originalAmount: basePrice,
    discountAmount: 0
  };
}

function calculatePriceBreakdownWithDiscount(originalAmount, discountAmount, currency = 'CLP') {
  const discountedAmount = Math.max(0, originalAmount - discountAmount);
  const breakdown = calculatePriceBreakdown(discountedAmount, currency);
  
  return {
    ...breakdown,
    originalAmount,
    discountAmount
  };
}

function calculateDiscount(baseAmount, promoCode) {
  let discountAmount = 0;

  switch (promoCode.type) {
    case 'PERCENTAGE':
      discountAmount = (baseAmount * promoCode.value) / 100;
      if (promoCode.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, promoCode.maxDiscountAmount);
      }
      break;

    case 'FIXED_AMOUNT':
      discountAmount = Math.min(promoCode.value, baseAmount);
      break;

    case 'FREE':
      discountAmount = baseAmount;
      break;

    default:
      discountAmount = 0;
  }

  discountAmount = Math.min(discountAmount, baseAmount);
  discountAmount = Math.max(0, discountAmount);

  const finalAmount = Math.max(0, baseAmount - discountAmount);

  return {
    discountAmount: Math.round(discountAmount),
    finalAmount: Math.round(finalAmount)
  };
}

// Test 1: Entrada de $10,000 con descuento del 20%
console.log("=== TEST 1: Descuento del 20% ===");
const basePrice1 = 10000;
const promoCode1 = { type: 'PERCENTAGE', value: 20 };

const discount1 = calculateDiscount(basePrice1, promoCode1);
console.log("Precio base:", basePrice1);
console.log("Descuento calculado:", discount1);

const breakdown1 = calculatePriceBreakdownWithDiscount(basePrice1, discount1.discountAmount);
console.log("Breakdown final:", breakdown1);
console.log("Monto a enviar a WebPay:", breakdown1.totalPrice);
console.log("");

// Test 2: Entrada de $5,000 con descuento fijo de $1,000
console.log("=== TEST 2: Descuento fijo de $1,000 ===");
const basePrice2 = 5000;
const promoCode2 = { type: 'FIXED_AMOUNT', value: 1000 };

const discount2 = calculateDiscount(basePrice2, promoCode2);
console.log("Precio base:", basePrice2);
console.log("Descuento calculado:", discount2);

const breakdown2 = calculatePriceBreakdownWithDiscount(basePrice2, discount2.discountAmount);
console.log("Breakdown final:", breakdown2);
console.log("Monto a enviar a WebPay:", breakdown2.totalPrice);
console.log("");

// Test 3: Entrada gratuita (100% descuento)
console.log("=== TEST 3: Entrada gratuita ===");
const basePrice3 = 8000;
const promoCode3 = { type: 'FREE', value: 0 };

const discount3 = calculateDiscount(basePrice3, promoCode3);
console.log("Precio base:", basePrice3);
console.log("Descuento calculado:", discount3);

const breakdown3 = calculatePriceBreakdownWithDiscount(basePrice3, discount3.discountAmount);
console.log("Breakdown final:", breakdown3);
console.log("Monto a enviar a WebPay:", breakdown3.totalPrice);
