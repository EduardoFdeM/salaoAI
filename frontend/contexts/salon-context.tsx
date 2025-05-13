"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';

interface SalonInfo {
  id: string;
  name: string;
  role: string;
  clientRequiredFields?: {
    phoneRequired: boolean;
    emailRequired: boolean;
  };
  // Outros dados do salão
}

interface SalonContextType {
  salon: SalonInfo | null;
  loading: boolean;
  error: string | null;
  fetchSalonDetails: () => Promise<void>;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

export function SalonProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [salon, setSalon] = useState<SalonInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalonDetails = async () => {
    // Se não tiver usuário ou não tiver salon_id, não busca
    if (!user || !user.salon_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar detalhes do salão
      const response = await fetch('/api/salon', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar dados do salão');
      }

      const data = await response.json();
      setSalon(data);
    } catch (err) {
      console.error('Erro ao buscar detalhes do salão:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.salon_id) {
      fetchSalonDetails();
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <SalonContext.Provider value={{ salon, loading, error, fetchSalonDetails }}>
      {children}
    </SalonContext.Provider>
  );
}

export function useSalon() {
  const context = useContext(SalonContext);
  if (context === undefined) {
    throw new Error('useSalon deve ser usado dentro de um SalonProvider');
  }
  return context;
} 