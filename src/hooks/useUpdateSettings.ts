import { useState } from 'react';

interface UpdateSettingsData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  producerName?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
}

export function useUpdateSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateSettings = async (data: UpdateSettingsData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar configuración');
      }

      const result = await response.json();
      setSuccess(true);
      
      // Auto-clear success after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateSettings,
    loading,
    error,
    success,
    clearError: () => setError(null),
  };
}
