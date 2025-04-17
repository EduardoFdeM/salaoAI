"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { UserRole } from '@/types/auth'
import DashboardLayout from '@/components/layout/dashboard-layout'

export default function SalonLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showLoading, setShowLoading] = useState(false)

  // Permitir acesso para donos de salão e recepcionistas
  const hasAccess = user && (user.role === UserRole.SALON_OWNER || user.role === UserRole.RECEPTIONIST)

  useEffect(() => {
    // Redireciona se não estiver carregando e não tiver acesso
    if (!loading && !hasAccess) {
      router.push('/login')
    }
    
    // Mostra loading apenas no cliente para evitar erros de hidratação
    // Garantindo que a UI não pisque mostrando conteúdo não autorizado
    setShowLoading(loading);

  }, [user, loading, router, hasAccess])

  // Exibe loading enquanto verifica autenticação
  if (showLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  // Não renderiza nada se não tiver acesso (será redirecionado)
  if (!hasAccess) {
    return null 
  }

  // Renderiza o layout do dashboard para usuários autorizados
  return <DashboardLayout>{children}</DashboardLayout>
} 