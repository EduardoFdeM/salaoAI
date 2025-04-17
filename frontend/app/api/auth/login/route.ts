import { NextResponse } from 'next/server'
import { UserRole } from '@/types/auth'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development-only'

// Usuários mockados para teste
const MOCK_USERS = [
  {
    id: '1',
    email: 'superuser@example.com',
    password: 'superuser123',
    name: 'Super Usuário',
    role: UserRole.SUPERUSER,
    is_active: true,
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Administrador',
    role: UserRole.ADMIN,
    is_active: true,
  },
  {
    id: '3',
    email: 'salon@example.com',
    password: 'salon123',
    name: 'Dono do Salão',
    role: UserRole.SALON_OWNER,
    salon_id: '1',
    is_active: true,
  },
  {
    id: '4',
    email: 'professional@example.com',
    password: 'professional123',
    name: 'Profissional',
    role: UserRole.PROFESSIONAL,
    salon_id: '1',
    is_active: true,
  },
  {
    id: '5',
    email: 'receptionist@example.com',
    password: 'receptionist123',
    name: 'Recepcionista',
    role: UserRole.RECEPTIONIST,
    salon_id: '1',
    is_active: true,
  },
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário pelos dados fornecidos
    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password && u.is_active
    )

    if (!user) {
      return NextResponse.json(
        { message: 'Email ou senha inválidos' },
        { status: 401 }
      )
    }

    // Remover a senha do objeto usuário
    const { password: _, ...userWithoutPassword } = user

    // Gerar token JWT
    const token = jwt.sign(userWithoutPassword, JWT_SECRET, {
      expiresIn: '30d',
    })

    // Configurar cookie para o token
    const response = NextResponse.json({
      token,
      user: userWithoutPassword,
    })

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      sameSite: 'strict',
    })

    return response
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 