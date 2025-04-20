"use client"

import { useSalon } from '@/hooks/use-salon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/contexts/auth-context';

// Componente Skeleton simples
const SkeletonSimple = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export function SalonInfo() {
  const { salon, loading, error } = useSalon();
  const { user } = useAuth();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[180px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Erro ao carregar informações</CardTitle>
          <CardDescription>Não foi possível obter os dados do salão</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!salon) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum salão encontrado</CardTitle>
          <CardDescription>
            {user?.role === 'ADMIN' || user?.role === 'SUPERUSER' 
              ? 'Você não está associado a nenhum salão'
              : 'Você precisa criar ou ser associado a um salão'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  function formatBusinessHours(hoursJson: string) {
    try {
      const hours = JSON.parse(hoursJson);
      // Aqui você poderia formatar as horas de funcionamento de forma mais amigável
      // Este é apenas um exemplo simples
      return `Aberto de seg a sex`;
    } catch (e) {
      return 'Horário não disponível';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{salon.name}</CardTitle>
        <CardDescription>
          {salon.role === 'OWNER' 
            ? 'Você é o proprietário deste salão' 
            : `Você é ${salon.role === 'PROFESSIONAL' ? 'profissional' : 'recepcionista'} neste salão`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm flex items-center">
            <span className="font-medium mr-2">Endereço:</span> {salon.address}
          </p>
          <p className="text-sm flex items-center">
            <span className="font-medium mr-2">Telefone:</span> {salon.phone}
          </p>
          <p className="text-sm flex items-center">
            <span className="font-medium mr-2">Email:</span> {salon.email}
          </p>
          <p className="text-sm flex items-center">
            <span className="font-medium mr-2">Horário:</span> {formatBusinessHours(salon.businessHours)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 