// Test para API de códigos promocionales
const testPayload = {
  name: "Test Monto Fijo",
  description: "Prueba de código de monto fijo",
  type: "FIXED_AMOUNT",
  value: 5000,
  validFrom: "2025-08-22T12:00:00",
  validUntil: "2025-12-31T23:59:59",
  generateCode: true,
  usageLimit: 50
};

console.log("=== Test Payload ===");
console.log(JSON.stringify(testPayload, null, 2));

// Verificaciones básicas
console.log("\n=== Verificaciones ===");
console.log("Tipo de 'type':", typeof testPayload.type);
console.log("Tipo de 'value':", typeof testPayload.value);
console.log("Value > 0:", testPayload.value > 0);
console.log("Value es NaN:", isNaN(testPayload.value));
console.log("Value es undefined:", testPayload.value === undefined);

// Simular validación
const isValid = testPayload.type !== "FREE" && 
                testPayload.value !== undefined && 
                !isNaN(testPayload.value) && 
                testPayload.value > 0;

console.log("¿Debería pasar validación?:", isValid);
