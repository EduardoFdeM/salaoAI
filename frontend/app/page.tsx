"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/auth-context'

export default function Home() {
  const { user, loading, getInitialRoute } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push(getInitialRoute())
      } else {
        router.push('/login')
      }
    }
  }, [loading, user, getInitialRoute, router])

  return (
    <div suppressHydrationWarning>
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
          <h1 className="text-4xl font-bold text-center mb-8">
            Sistema de Agendamento para Salões
          </h1>
          <p className="text-center mb-4">
            Redirecionando...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </main>
    </div>
  )
} 