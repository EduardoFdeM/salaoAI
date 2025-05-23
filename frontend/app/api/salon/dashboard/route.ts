import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// URL do backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export async function GET() {
  try {
    // Obter o token dos cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Fazer requisição para o backend - corrigido o caminho da API
    const response = await fetch(`${API_URL}/api/salon/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Obter dados da resposta
    const data = await response.json();

    // Se a resposta não foi bem-sucedida, retornar o erro
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Erro ao obter dados do dashboard' },
        { status: response.status }
      );
    }

    // Retornar os dados do dashboard
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao obter dados do dashboard:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 