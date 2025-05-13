import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getToken, getUserFromToken } from '../../../../../lib/auth';

// URL do backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

// Obter serviço específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Obter o token e o usuário
    const token = getToken({ cookies: cookies() });
    const user = getUserFromToken({ cookies: cookies() });
    
    if (!token || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      );
    }

    const { id } = params;

    // Fazer requisição para o backend
    const response = await fetch(`${API_URL}/api/services/${id}`, {
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
        { error: data.message || 'Erro ao obter serviço' },
        { status: response.status }
      );
    }

    // Retornar os dados do serviço
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao obter serviço:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Atualizar serviço
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Obter o token e o usuário
    const token = getToken({ cookies: cookies() });
    const user = getUserFromToken({ cookies: cookies() });
    
    if (!token || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      );
    }

    const { id } = params;
    const serviceData = await request.json();

    // Fazer requisição para o backend
    const response = await fetch(`${API_URL}/api/services/${id}`, {
      method: 'PUT',
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
        { error: data.message || 'Erro ao atualizar serviço' },
        { status: response.status }
      );
    }

    // Retornar os dados do serviço atualizado
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Excluir serviço
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Obter o token e o usuário
    const token = getToken({ cookies: cookies() });
    const user = getUserFromToken({ cookies: cookies() });
    
    if (!token || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      );
    }

    const { id } = params;

    // Fazer requisição para o backend
    const response = await fetch(`${API_URL}/api/services/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Se a resposta não foi bem-sucedida, tentar obter dados de erro
    if (!response.ok) {
      try {
        const errorData = await response.json();
        return NextResponse.json(
          { error: errorData.message || 'Erro ao excluir serviço' },
          { status: response.status }
        );
      } catch (e) {
        return NextResponse.json(
          { error: 'Erro ao excluir serviço' },
          { status: response.status }
        );
      }
    }

    // Retornar sucesso (204 No Content)
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 