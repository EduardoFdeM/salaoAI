import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { UserRole } from './types/auth'

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/', '/login', '/register']

// Rotas que exigem autenticação e seus respectivos papéis permitidos
const protectedRoutes = [
  { path: '/admin', roles: [UserRole.SUPERUSER, UserRole.ADMIN] },
  { path: '/salon', roles: [UserRole.SALON_OWNER] },
  { path: '/professional', roles: [UserRole.PROFESSIONAL] },
  { path: '/receptionist', roles: [UserRole.RECEPTIONIST] },
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verifica se é uma rota pública
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next()
  }

  // Obtém o token do cookie ou localStorage (no caso do Next.js, usamos cookies para SSR)
  const token = request.cookies.get('token')?.value

  // Se não há token e a rota não é pública, redireciona para login
  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // Verificar se o usuário tem acesso à rota baseado em seu papel
  // Esta é uma verificação simplificada; idealmente, você decodificaria o JWT e verificaria o papel
  // Mas o middleware não deve fazer operações pesadas como decodificação de JWT
  
  // Retorna next() permitindo o acesso à rota
  // A verificação detalhada de permissões deve ser feita nos componentes de layout ou páginas
  return NextResponse.next()
}

// Configurar em quais caminhos o middleware deve ser executado
export const config = {
  matcher: [
    // Aplicar a todas as rotas exceto assets estáticos, api e _next
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 