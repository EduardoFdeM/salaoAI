import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// URL do backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

// Obter lista de serviços
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

    // Fazer requisição para o backend
    const response = await fetch(`${API_URL}/api/services`, {
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
        { message: data.message || 'Erro ao obter serviços' },
        { status: response.status }
      );
    }

    // Retornar os dados dos serviços
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao obter serviços:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Criar um novo serviço
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Obter dados do corpo da requisição
    const serviceData = await request.json();

    // Fazer requisição para o backend
    const response = await fetch(`${API_URL}/api/services`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData),
    });

    // Obter dados da resposta
    const data = await response.json();

    // Se a resposta não foi bem-sucedida, retornar o erro
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Erro ao criar serviço' },
        { status: response.status }
      );
    }

    // Retornar os dados do serviço criado
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 