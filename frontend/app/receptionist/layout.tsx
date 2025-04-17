"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { UserRole } from '@/types/auth'

export default function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para área do salão
    if (!loading) {
      if (user && user.role === UserRole.RECEPTIONIST) {
        router.push('/salon/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  // Este layout não renderiza nada, apenas redireciona
  return null
} 