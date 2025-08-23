// Test simple para códigos promocionales de monto fijo
const testData = {
  name: "Test FIXED_AMOUNT",
  description: "Test para código de monto fijo",
  type: "FIXED_AMOUNT",
  value: 5000, // $5000 pesos chilenos
  validFrom: "2025-08-22T10:00",
  validUntil: "2025-12-31T23:59",
  generateCode: true,
  usageLimit: 100
};

console.log("Test data for FIXED_AMOUNT promo code:");
console.log(JSON.stringify(testData, null, 2));

// Verificar tipos
console.log("\nType checks:");
console.log("value type:", typeof testData.value);
console.log("value is NaN:", isNaN(testData.value));
console.log("value > 0:", testData.value > 0);
console.log("value <= 0:", testData.value <= 0);
