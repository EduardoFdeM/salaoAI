import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface SalonData {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  businessHours: string;
  notificationSettings: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  settings?: Record<string, string>;
  role?: string;
}

export function useSalon() {
  const { user } = useAuth();
  const [salon, setSalon] = useState<SalonData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalon = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/salon');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao carregar dados do salão');
        }
        
        const data = await response.json();
        setSalon(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Erro ao carregar dados do salão:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalon();
  }, [user]);

  return { salon, loading, error };
} 