import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// URL do backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, phone, role } = body

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { message: 'Nome, email, senha e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Fazer requisição para o backend
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, phone, role }),
    })

    // Obter dados da resposta
    const data = await response.json()

    // Se a resposta não foi bem-sucedida, retornar o erro
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Erro ao registrar usuário' },
        { status: response.status }
      )
    }

    // Configurar cookie para o token
    const cookieStore = cookies()
    cookieStore.set({
      name: 'token',
      value: data.access_token,
      httpOnly: true,
      path: '/',
      maxAge: data.expires_in,
      sameSite: 'strict',
    })

    // Retornar os dados do usuário e o token
    return NextResponse.json({
      token: data.access_token,
      user: data.user,
    })
  } catch (error) {
    console.error('Erro no registro:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 