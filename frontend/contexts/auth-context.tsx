"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User, UserRole } from '@/types/auth'
import { getToken, removeToken, setToken, getUserFromToken } from '@/lib/auth'
import { parseCookies } from 'nookies'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  getInitialRoute: () => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = getUserFromToken()
        if (userData) {
          setUser(userData)
        }
      } catch (error) {
        console.error('Erro ao validar autenticação:', error)
        removeToken()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Credenciais inválidas')
      }

      const data = await response.json()
      setToken(data.token)
      setUser(data.user)
      return data.user
    } catch (error) {
      throw error instanceof Error ? error : new Error('Erro ao fazer login')
    }
  }

  const logout = () => {
    removeToken()
    setUser(null)
    router.push('/login')
  }

  const getInitialRoute = () => {
    if (!user) return '/login'
    
    switch (user.role) {
      case UserRole.SUPERUSER:
      case UserRole.ADMIN:
        return '/admin/dashboard'
      case UserRole.SALON_OWNER:
        return '/salon/dashboard'
      case UserRole.PROFESSIONAL:
        return '/professional/dashboard'
      case UserRole.RECEPTIONIST:
        return '/receptionist/dashboard'
      default:
        return '/login'
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getInitialRoute }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
} 