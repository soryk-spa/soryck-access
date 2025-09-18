import { toast } from 'sonner';
import type { PromoCode } from '@/types';

export function usePromoCodeSharing() {
  
  const sharePromoCode = async (
    promoCode: PromoCode,
    formatDiscount: (type: string, value: number) => string
  ) => {
    const text = `🎫 ¡Descuento especial! Usa el código ${promoCode.code} y obtén ${formatDiscount(promoCode.type, promoCode.value)} en tu próxima compra.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Código promocional: ${promoCode.name}`,
          text,
        });
      } catch {
        toast.error('No se pudo compartir el código');
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Texto de promoción copiado al portapapeles');
    }
  };

  
  const exportPromoCodes = (promoCodes: PromoCode[]) => {
    const headers = [
      'Código', 'Nombre', 'Tipo', 'Valor', 'Estado', 'Usados', 'Límite', 'Moneda', 'Válido desde', 'Válido hasta'
    ];
    const rows = promoCodes.map(code => [
      code.code,
      code.name,
      code.type,
      code.value,
      code.status,
      code.usedCount,
      code.usageLimit,
      code.currency,
      code.validFrom,
      code.validUntil,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'promo-codes.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Códigos promocionales exportados exitosamente');
  };

  return {
    sharePromoCode,
    exportPromoCodes,
  };
}
