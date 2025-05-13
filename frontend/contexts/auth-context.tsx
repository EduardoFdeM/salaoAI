"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '../types/auth'
import { getToken, removeToken, setToken, getUserFromToken } from '../lib/auth'
import { parseCookies } from 'nookies'

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  getInitialRoute: () => string;
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
      console.log('Attempting login...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Login failed:', error);
        throw new Error(error.message || 'Credenciais inválidas')
      }

      const data = await response.json()
      console.log('Login successful');
      setToken(data.token)
      setUser(data.user)
      return data.user
    } catch (error) {
      console.error('Login error:', error);
      throw error instanceof Error ? error : new Error('Erro ao fazer login')
    }
  }

  const register = async (data: RegisterData): Promise<User> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao registrar usuário')
      }

      const responseData = await response.json()
      setToken(responseData.token)
      setUser(responseData.user)
      return responseData.user
    } catch (error) {
      throw error instanceof Error ? error : new Error('Erro ao registrar usuário')
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
      case 'SUPERUSER':
      case 'ADMIN':
        return '/admin/dashboard'
      case 'FRANCHISE_OWNER':
        return '/franchise/dashboard'
      case 'SALON_OWNER':
        return '/salon/dashboard'
      case 'PROFESSIONAL':
        return '/professional/dashboard'
      case 'RECEPTIONIST':
        return '/receptionist/dashboard'
      default:
        return '/login'
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getInitialRoute }}>
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