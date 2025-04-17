import { jwtDecode } from 'jwt-decode'
import type { User } from '@/types/auth'
import { parseCookies, setCookie, destroyCookie } from 'nookies'

export const STORAGE_KEY = '@SalonApp:token'

export function setToken(token: string, ctx?: any) {
  // Salva tanto em localStorage para cliente quanto em cookies para SSR
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, token)
  }
  
  // Cookies para SSR com expiração de 30 dias
  setCookie(ctx, 'token', token, {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  })
}

export function getToken(ctx?: any): string | null {
  if (ctx) {
    const cookies = parseCookies(ctx)
    return cookies.token
  }
  
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY) || parseCookies().token || null
  }
  
  return null
}

export function removeToken(ctx?: any) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
  
  destroyCookie(ctx, 'token', { path: '/' })
}

export function getUserFromToken(ctx?: any): User | null {
  const token = getToken(ctx)
  if (!token) return null
  
  try {
    return jwtDecode(token)
  } catch {
    removeToken(ctx)
    return null
  }
}

export function isAuthenticated(ctx?: any): boolean {
  return !!getToken(ctx)
} 