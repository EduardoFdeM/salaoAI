import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// URL do backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

export async function POST(request: Request) {
  try {
    // Log for debugging
    console.log(`Using backend URL: ${API_URL}`);
    
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Fazer requisição para o backend
    const loginUrl = `${API_URL}/api/auth/login`;
    console.log(`Sending login request to: ${loginUrl}`);
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    // Obter dados da resposta
    const data = await response.json()
    console.log('Login response status:', response.status);

    // Se a resposta não foi bem-sucedida, retornar o erro
    if (!response.ok) {
      console.error('Login failed:', data);
      return NextResponse.json(
        { message: data.message || 'Credenciais inválidas' },
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
    console.error('Erro no login:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 