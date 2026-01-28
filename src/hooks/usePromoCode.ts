

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import type { PromoCode, PromoCodeFilters } from '@/types';





export function usePromoCodeManagement(initialPromoCodes: PromoCode[]) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(initialPromoCodes);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const togglePromoCodeStatus = async (promoCode: PromoCode) => {
    const newStatus = promoCode.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const action = newStatus === "ACTIVE" ? "activar" : "desactivar";
    
    setLoadingStates(prev => ({ ...prev, [promoCode.id]: true }));

    try {
      const response = await fetch(`/api/promo-codes/${promoCode.id}/toggle-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Error al ${action} el código promocional`);
      }

      
      setPromoCodes(prev => 
        prev.map(code => 
          code.id === promoCode.id 
            ? { ...code, status: newStatus }
            : code
        )
      );

      toast.success(`Código promocional ${action === "activar" ? "activado" : "desactivado"} exitosamente`);
    } catch (error) {
      console.error(`Error ${action} promo code:`, error);
      toast.error(error instanceof Error ? error.message : `Error al ${action} el código promocional`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [promoCode.id]: false }));
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado al portapapeles");
  };

  return {
    promoCodes,
    loadingStates,
    togglePromoCodeStatus,
    copyToClipboard,
  };
}





export function usePromoCodeFilters(promoCodes: PromoCode[]) {
  const [filters, setFilters] = useState<PromoCodeFilters>({
    search: "",
    status: "all",
  });

  const filteredPromoCodes = useMemo(() => {
    return promoCodes.filter((code) => {
      const matchesSearch = !filters.search || 
        code.code.toLowerCase().includes(filters.search.toLowerCase()) ||
        code.name.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = filters.status === "all" || code.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [promoCodes, filters]);

  const updateFilter = <K extends keyof PromoCodeFilters>(
    key: K, 
    value: PromoCodeFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: "", status: "all" });
  };

  return {
    filters,
    filteredPromoCodes,
    updateFilter,
    clearFilters,
  };
}





export function usePromoCodeStats(promoCodes: PromoCode[]) {
  const stats = useMemo(() => {
    const total = promoCodes.length;
    const active = promoCodes.filter(code => code.status === "ACTIVE").length;
    const totalUsages = promoCodes.reduce((sum, code) => sum + code.usedCount, 0);
    const expired = promoCodes.filter(code => code.status === "EXPIRED").length;
    const inactive = promoCodes.filter(code => code.status === "INACTIVE").length;
    const usedUp = promoCodes.filter(code => code.status === "USED_UP").length;

    return {
      total,
      active,
      inactive,
      expired,
      usedUp,
      totalUsages,
      activePercentage: total > 0 ? (active / total) * 100 : 0,
      usageRate: total > 0 ? (totalUsages / total) : 0,
    };
  }, [promoCodes]);

  return stats;
}





export function usePromoCodeSharing() {
  const sharePromoCode = (code: PromoCode, formatDiscount: (type: string, value: number) => string) => {
    const shareText = `🎫 ¡Descuento especial! Usa el código ${code.code} y obtén ${formatDiscount(code.type, code.value)} en tu próxima compra.`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `Código promocional: ${code.name}`,
        text: shareText,
      });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      toast.success("Texto de promoción copiado al portapapeles");
    }
  };

  const exportPromoCodes = (promoCodes: PromoCode[]) => {
    const csv = generatePromoCodeCSV(promoCodes);
    
    if (typeof document !== 'undefined') {
      downloadCSV(csv, 'codigos-promocionales.csv');
      toast.success("Códigos promocionales exportados exitosamente");
    } else {
      
      return csv;
    }
  };

  return {
    sharePromoCode,
    exportPromoCodes,
  };
}





function generatePromoCodeCSV(promoCodes: PromoCode[]): string {
  const headers = ['Código', 'Nombre', 'Tipo', 'Valor', 'Estado', 'Usado', 'Límite', 'Válido Desde', 'Válido Hasta'];
  
  const rows = promoCodes.map(code => [
    code.code,
    code.name,
    code.type,
    code.value.toString(),
    code.status,
    code.usedCount.toString(),
    code.usageLimit?.toString() || 'Sin límite',
    code.validFrom,
    code.validUntil || 'Sin fecha límite'
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
