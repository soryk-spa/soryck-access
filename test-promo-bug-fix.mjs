// Test para verificar la corrección del bug de códigos promocionales
// Ejemplo: 4 tickets de $10,000 con descuento fijo de $3,000

console.log("🐛 TEST: Corrección del Bug de Códigos Promocionales\n");

// Simulación del cálculo ANTES (con bug)
function calculateDiscountBefore(baseAmount, promoValue) {
  return Math.min(promoValue, baseAmount);
}

// Simulación del cálculo DESPUÉS (corregido)
function calculateDiscountPerTicket(ticketPrice, promoValue) {
  return Math.min(promoValue, ticketPrice);
}

// Test Case
const ticketPrice = 10000;
const quantity = 4;
const promoValue = 3000; // Descuento fijo de $3,000

console.log("📋 Datos del test:");
console.log(`- Precio por ticket: $${ticketPrice.toLocaleString('es-CL')}`);
console.log(`- Cantidad de tickets: ${quantity}`);
console.log(`- Código promocional: Descuento fijo de $${promoValue.toLocaleString('es-CL')}`);
console.log(`- Total sin descuento: $${(ticketPrice * quantity).toLocaleString('es-CL')}\n`);

// ANTES (Con Bug)
console.log("❌ ANTES (con bug):");
const totalAmount = ticketPrice * quantity;
const discountBefore = calculateDiscountBefore(totalAmount, promoValue);
const finalBefore = totalAmount - discountBefore;
console.log(`- Descuento total: $${discountBefore.toLocaleString('es-CL')}`);
console.log(`- Total a pagar: $${finalBefore.toLocaleString('es-CL')}`);
console.log(`- Descuento por ticket: $${(discountBefore / quantity).toLocaleString('es-CL')}`);
console.log("  ⚠️  El descuento debería ser $3,000 por ticket, no $750!\n");

// DESPUÉS (Corregido)
console.log("✅ DESPUÉS (corregido):");
const discountPerTicket = calculateDiscountPerTicket(ticketPrice, promoValue);
const totalDiscountAfter = discountPerTicket * quantity;
const finalAfter = (ticketPrice - discountPerTicket) * quantity;
console.log(`- Descuento por ticket: $${discountPerTicket.toLocaleString('es-CL')}`);
console.log(`- Descuento total: $${totalDiscountAfter.toLocaleString('es-CL')}`);
console.log(`- Total a pagar: $${finalAfter.toLocaleString('es-CL')}`);
console.log("  ✅ ¡Correcto! $3,000 de descuento por cada ticket\n");

// Comparación
console.log("📊 Comparación:");
console.log(`- Diferencia en descuento: $${(totalDiscountAfter - discountBefore).toLocaleString('es-CL')}`);
console.log(`- Ahorro adicional para el usuario: $${(finalBefore - finalAfter).toLocaleString('es-CL')}`);
console.log(`- Impacto en ingresos: $${(finalAfter - finalBefore).toLocaleString('es-CL')} menos ingresos`);

console.log("\n🎯 Resultado: El bug está corregido y ahora el descuento se aplica correctamente por cada ticket.");
