"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/auth-context'
import { UserRole } from '../../types/auth'
import DashboardLayout from '../../components/layout/dashboard-layout'

export default function ProfessionalLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== UserRole.PROFESSIONAL)) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  if (!user || user.role !== UserRole.PROFESSIONAL) {
    return null // Será redirecionado pelo useEffect
  }

  return <DashboardLayout>{children}</DashboardLayout>
}