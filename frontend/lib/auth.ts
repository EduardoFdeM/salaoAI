import { jwtDecode } from 'jwt-decode'
import type { User } from '@/types/auth'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

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

export function getToken(options?: { cookies?: ReadonlyRequestCookies }): string | null {
  // 1. Tenta ler do objeto cookies passado (App Router API Route/Server Component)
  if (options?.cookies?.get) {
    return options.cookies.get('token')?.value || null;
  }
  
  // 2. Fallback para localStorage (Client-side)
  if (typeof window !== 'undefined') {
    const localStorageToken = localStorage.getItem(STORAGE_KEY)
    if (localStorageToken) return localStorageToken;
  }

  // 3. Fallback para parseCookies de nookies (Client-side ou Pages Router getServerSideProps)
  // Nota: parseCookies() sem ctx só funciona client-side. 
  // Para Pages Router ctx seria passado implicitamente por nookies
  try {
    const cookies = parseCookies(); 
    return cookies.token || null;
  } catch (error) {
    // Pode acontecer em ambientes sem document (server-side sem ctx adequado para nookies)
    console.warn("Não foi possível fazer parse dos cookies no contexto atual (getToken).");
    return null;
  }
}

export function removeToken(ctx?: any) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
  
  destroyCookie(ctx, 'token', { path: '/' })
}

export function getUserFromToken(options?: { cookies?: ReadonlyRequestCookies }): User | null {
  const token = getToken(options)
  if (!token) return null
  
  try {
    const decoded: any = jwtDecode(token)
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      salon_id: decoded.salon_id,
    }
  } catch (error){
    console.error("Erro ao decodificar token:", error);
    removeToken()
    return null
  }
}

export function isAuthenticated(options?: { cookies?: ReadonlyRequestCookies }): boolean {
  return !!getToken(options)
} 